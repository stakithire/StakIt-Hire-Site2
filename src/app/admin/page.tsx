

'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { MoreHorizontal, CheckCircle, XCircle, Clock, Loader2, User, Calendar as CalendarIcon, Hash, AlertTriangle, Package, BellRing, BarChart2, Users, Wrench, Search, MailQuestion, Archive, Eye, Warehouse, Minus, Plus, GanttChartSquare, ClipboardList, MessageSquare, Shield, Circle, ArrowDown, ArrowUp, Info, Edit, UploadCloud, Paperclip, Image as ImageIcon, QrCode, TrendingUp, TrendingDown, DollarSign, BarChartBig, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdmin, useUser, useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import type { OrderEvidence, QuoteRequestWithId, ContactMessageWithId, InventoryItem, OrderEvidenceWithId, InventoryActivityWithId } from '@/lib/types';
import { getAdminQuoteRequests, updateQuoteStatus, getContactMessages, updateMessageStatus, getInventory, setInventoryItem, updateQuoteDetails, getInventoryActivity, logCrateRetirement } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from '@/components/ui/input';
import { boxHireServices, services as otherServices, protectionAddOns, tvProtectionAddOns, pricingBundles, inventoryTrackedTvProtectionAddOns, tvProtectorSizeToIdMap, inventoryTrackedReusableProtectors, reusableProtectorSizeToIdMap, inventoryTrackedMattressProtectors } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { calculateQuoteTotal } from '@/lib/quote-calculator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { EditQuoteForm } from '@/components/admin/edit-quote-form';
import { collection, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

// --- STYLING ---
const quoteStatusStyles: { [key: string]: string } = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
  'In Review': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
  Approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
  Paid: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800',
  Delivered: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
  Completed: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-800',
  Rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
};

const messageStatusStyles: { [key: string]: string } = {
  New: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
  Read: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-800',
  Archived: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-800',
};

const inventoryStatusStyles: { [key: string]: { icon: React.ElementType, style: string } } = {
  'In Stock': { icon: CheckCircle, style: 'text-green-600' },
  'Low Stock': { icon: AlertTriangle, style: 'text-yellow-600' },
  'Out of Stock': { icon: XCircle, style: 'text-red-600' },
};


// --- HELPER FUNCTIONS ---

/**
 * A helper function that unpacks a quote request's items (including bundles)
 * into a map of individual, trackable inventory item IDs and their total quantities.
 * This is the source of truth for inventory calculations.
 */
const getTrackableItemsFromQuote = (items: QuoteRequestWithId['items']): Map<string, number> => {
    const trackableMap = new Map<string, number>();
    const allServicesAndBoxes = [...boxHireServices, ...otherServices, ...protectionAddOns, ...tvProtectionAddOns, ...inventoryTrackedTvProtectionAddOns, ...inventoryTrackedReusableProtectors];

    const getBundleComponents = (bundleId: string): { itemId: string; quantity: number }[] => {
        const bundle = pricingBundles.find(b => b.id === bundleId);
        if (!bundle) return [];

        const components: { itemId: string; quantity: number }[] = [];

        bundle.contents.forEach(contentString => {
            const boxStakMatch = contentString.match(/(\d+)\s+Box\s+Stak/);
            if (boxStakMatch) {
                const count = parseInt(boxStakMatch[1], 10);
                components.push({ itemId: 'crates', quantity: count });
                return;
            }
            
            const quantityMatch = contentString.match(/(\d+)x\s+/);
            const itemQuantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;
            const itemName = (quantityMatch ? contentString.replace(quantityMatch[0], '') : contentString).trim();
            
            const service = allServicesAndBoxes.find(s => 
                s.name === itemName || 
                `${s.name} (Hire)` === itemName ||
                `${s.name} (Purchase)` === itemName
            );

            if (service && service.trackInventory) {
                components.push({ itemId: service.id, quantity: itemQuantity });
            }
        });
        return components;
    };

    items.forEach(quoteItem => {
        if (quoteItem.id.startsWith('bundle-')) {
            const components = getBundleComponents(quoteItem.id);
            components.forEach(component => {
                const totalQuantity = component.quantity * quoteItem.quantity;
                trackableMap.set(component.itemId, (trackableMap.get(component.itemId) || 0) + totalQuantity);
            });
        } else if (quoteItem.id.startsWith('box-')) {
            const boxService = boxHireServices.find(b => b.id === quoteItem.id);
            if (boxService?.boxCount) {
                const totalCrates = boxService.boxCount * quoteItem.quantity;
                trackableMap.set('crates', (trackableMap.get('crates') || 0) + totalCrates);
            }
        } else if (quoteItem.id.startsWith('reusable-protector-') && quoteItem.sizes) {
            quoteItem.sizes.forEach(size => {
                const itemId = reusableProtectorSizeToIdMap[size];
                if (itemId) {
                    trackableMap.set(itemId, (trackableMap.get(itemId) || 0) + 1);
                }
            });
        } else if (quoteItem.id.includes('tv-protector-') && quoteItem.sizes) {
            quoteItem.sizes.forEach(size => {
                const itemId = tvProtectorSizeToIdMap[size];
                if (itemId) {
                    trackableMap.set(itemId, (trackableMap.get(itemId) || 0) + 1);
                }
            });
        }
        else {
            const serviceId = quoteItem.id.replace(/-(hire|purchase)$/, '');
            const service = allServicesAndBoxes.find(s => s.id === serviceId);
            if (service?.trackInventory) {
                trackableMap.set(serviceId, (trackableMap.get(serviceId) || 0) + quoteItem.quantity);
            }
        }
    });

    return trackableMap;
};


// --- SUB-COMPONENTS for TABS ---

function OverviewSection({ requests, messages }: { requests: QuoteRequestWithId[], messages: ContactMessageWithId[] }) {
    const totalRequests = requests.length;
    const approvedRequests = requests.filter(r => r.status === 'Approved').length;
    const pendingRequests = requests.filter(r => r.status === 'Pending' || r.status === 'In Review').length;
    const newMessages = messages.filter(m => m.status === 'New').length;

    const chartData = useMemo(() => {
        return Object.keys(quoteStatusStyles).map(status => ({
            name: status,
            total: requests.filter(req => req.status === status).length,
        }));
    }, [requests]);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalRequests}</div>
                    <p className="text-xs text-muted-foreground">All quote requests received</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Approved Quotes</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{approvedRequests}</div>
                    <p className="text-xs text-muted-foreground">Total quotes approved for payment</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Action</CardTitle>
                    <BellRing className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingRequests}</div>
                    <p className="text-xs text-muted-foreground">Quotes awaiting review or approval</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Messages</CardTitle>
                    <MailQuestion className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{newMessages}</div>
                    <p className="text-xs text-muted-foreground">Unread contact form submissions</p>
                </CardContent>
            </Card>
             <Card className="md:col-span-2 lg:col-span-4">
                <CardHeader>
                    <CardTitle>Quote Status Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} allowDecimals={false} />
                            <TooltipProvider>
                                <RechartsTooltip
                                    content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                Status
                                                </span>
                                                <span className="font-bold text-muted-foreground">
                                                {payload[0].payload.name}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                Total
                                                </span>
                                                <span className="font-bold">
                                                {payload[0].value}
                                                </span>
                                            </div>
                                            </div>
                                        </div>
                                        )
                                    }
                                    return null
                                    }}
                                />
                            </TooltipProvider>
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}

function LiveRentalsSection({ requests }: { requests: QuoteRequestWithId[] }) {
    const activeRentals = useMemo(() => {
        const today = new Date();
        return requests.filter(req => {
            const startDate = new Date(req.rentalStartDate);
            const endDate = new Date(req.rentalEndDate);
            return (req.status === 'Approved' || req.status === 'Paid') && today >= startDate && today <= endDate;
        });
    }, [requests]);

    const hiredEquipment = useMemo(() => activeRentals.reduce((acc, rental) => {
        rental.items.forEach(item => {
            const key = item.name;
            acc[key] = (acc[key] || 0) + item.quantity;
        });
        return acc;
    }, {} as { [key: string]: number }), [activeRentals]);
    
    return (
        <div className="grid gap-8 md:grid-cols-2 mb-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Current Renters</CardTitle>
                    <CardDescription>Customers with active rentals today.</CardDescription>
                </CardHeader>
                <CardContent>
                    {activeRentals.length > 0 ? (
                        <ul className="space-y-3">
                            {activeRentals.map(rental => (
                                <li key={rental.id} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                    <div>
                                        <p className="font-semibold">{rental.customerName}</p>
                                        <p className="text-sm text-muted-foreground">{new Date(rental.rentalStartDate).toLocaleDateString()} - {new Date(rental.rentalEndDate).toLocaleDateString()}</p>
                                    </div>
                                    <Badge variant={rental.status === 'Paid' ? 'default' : 'secondary'}>{rental.status === 'Paid' ? 'Paid' : 'Active'}</Badge>
                                </li>
                            ))}
                        </ul>
                    ) : ( <p className="text-sm text-muted-foreground text-center py-4">No active rentals today.</p> )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-primary" />Equipment on Hire</CardTitle>
                    <CardDescription>A live look at all equipment currently hired out.</CardDescription>
                </CardHeader>
                <CardContent>
                     {Object.keys(hiredEquipment).length > 0 ? (
                        <ul className="space-y-3 max-h-60 overflow-y-auto">
                            {Object.entries(hiredEquipment).map(([name, quantity]) => (
                                <li key={name} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                                    <p className="font-semibold">{name}</p>
                                    <p className="text-sm text-muted-foreground font-mono bg-background px-2 py-1 rounded-md">Qty: {quantity}</p>
                                </li>
                            ))}
                        </ul>
                    ) : ( <p className="text-sm text-muted-foreground text-center py-4">No equipment currently on hire.</p> )}
                </CardContent>
            </Card>
        </div>
    )
}

function RentalCalendar({ requests }: { requests: QuoteRequestWithId[] }) {
    const approvedRentals = useMemo(() => requests.filter(req => req.status === 'Approved' || req.status === 'Paid'), [requests]);

    const rentalEvents = useMemo(() => approvedRentals.flatMap(req => [
        { date: new Date(req.rentalStartDate), type: 'start', customer: req.customerName },
        { date: new Date(req.rentalEndDate), type: 'end', customer: req.customerName },
    ]), [approvedRentals]);

    const DayContent = useCallback((props: { date: Date }) => {
        const eventsOnDay = rentalEvents.filter(event => event.date.toDateString() === props.date.toDateString());
        if (eventsOnDay.length === 0) return <div className="relative w-full h-full flex items-center justify-center"><span>{props.date.getDate()}</span></div>;
        
        const startEvents = eventsOnDay.filter(e => e.type === 'start');
        const endEvents = eventsOnDay.filter(e => e.type === 'end');

        return (
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={cn(
                            "relative w-full h-full flex items-center justify-center rounded-md",
                            startEvents.length > 0 && endEvents.length > 0 && "bg-gradient-to-br from-green-200 to-red-200 dark:from-green-800 dark:to-red-800",
                            startEvents.length > 0 && endEvents.length === 0 && "bg-green-200 dark:bg-green-800",
                            endEvents.length > 0 && startEvents.length === 0 && "bg-red-200 dark:bg-red-800"
                        )}>
                             <span className="relative z-10">{props.date.getDate()}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <ul className="space-y-1">
                             {startEvents.map((event, i) => <li key={`start-${i}`} className="text-xs text-green-600 dark:text-green-300">Start: {event.customer}</li>)}
                             {endEvents.map((event, i) => <li key={`end-${i}`} className="text-xs text-red-600 dark:text-red-300">End: {event.customer}</li>)}
                        </ul>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>
        );
    }, [rentalEvents]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5 text-primary" />Rental Schedule</CardTitle>
                <CardDescription>Visual overview of rental start and end dates. Hover for details.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                 
                    <Calendar numberOfMonths={2} components={{ Day: DayContent }} className="p-0" />
                 
            </CardContent>
        </Card>
    );
}

function QuoteRequestDetails({ request, allRequests, inventory, onDamageLogged }: { request: QuoteRequestWithId; allRequests: QuoteRequestWithId[]; inventory: InventoryItem[]; onDamageLogged: () => void; }) {
    const formatPrice = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    
    const { items, rentalStartDate, rentalEndDate, stakitShield, customerName, customerEmail, dropOffAddress, collectionAddress, projectDescription, deliveryConfirmationTimestamp, status } = request;

    const calculation = useMemo(() => {
        return calculateQuoteTotal(request.items, request.rentalStartDate, request.rentalEndDate, request.stakitShield);
    }, [request]);

    const { total } = calculation;

    const availability = useMemo(() => {
        const isDateInRange = (date: Date, start: Date, end: Date) => {
            const time = date.getTime();
            return time >= start.getTime() && time <= end.getTime();
        };

        const requestStart = new Date(request.rentalStartDate);
        const requestEnd = new Date(request.rentalEndDate);

        const inventoryMap = new Map<string, number>(inventory.map(i => [i.id, i.quantity]));
        
        // 1. Get required items for THIS request
        const requiredItems = getTrackableItemsFromQuote(request.items);

        // 2. Calculate equipment hired out during the requested period by OTHER approved requests
        const hiredOutDuringPeriod = new Map<string, number>();
        const otherApprovedRequests = allRequests.filter(r => r.id !== request.id && (r.status === 'Approved' || r.status === 'Paid'));

        otherApprovedRequests.forEach(otherReq => {
            const otherStart = new Date(otherReq.rentalStartDate);
            const otherEnd = new Date(otherReq.rentalEndDate);

            if (isDateInRange(requestStart, otherStart, otherEnd) || isDateInRange(requestEnd, otherStart, otherEnd) || isDateInRange(otherStart, requestStart, requestEnd)) {
                const otherTrackables = getTrackableItemsFromQuote(otherReq.items);
                otherTrackables.forEach((quantity, itemId) => {
                    hiredOutDuringPeriod.set(itemId, (hiredOutDuringPeriod.get(itemId) || 0) + quantity);
                });
            }
        });

        // 3. Determine availability for each required item
        const availabilityResult: { name: string, status: 'In Stock' | 'Low Stock' | 'Out of Stock', available: number, required: number }[] = [];
        
        requiredItems.forEach((required, itemId) => {
            const totalStock = inventoryMap.get(itemId) || 0;
            const hiredOut = hiredOutDuringPeriod.get(itemId) || 0;
            const availableNow = totalStock - hiredOut;
            const remainingAfterThis = availableNow - required;

            let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
            if (availableNow < required) {
                status = 'Out of Stock';
            } else if (totalStock > 0 && remainingAfterThis / totalStock <= 0.2) { // Low stock if < 20% remains
                status = 'Low Stock';
            }
            availabilityResult.push({ name: inventory.find(i => i.id === itemId)?.name || itemId, status, available: availableNow, required });
        });
        
        return availabilityResult;
    }, [request, allRequests, inventory]);

    return (
        <div className="p-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary"/>Quote Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <ul className="space-y-3 text-sm">
                            {items.map((item, index) => (
                                <li key={index}>
                                    <div className="flex justify-between">
                                        <span>{item.name} x {item.quantity}</span>
                                        <span className="font-mono">{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                     {item.sizes && item.sizes.length > 0 && (
                                        <p className="text-xs text-muted-foreground pl-2">
                                            Sizes: {item.sizes.filter(s => s).join(', ') || 'Not specified'}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                         <div className="border-t pt-2 mt-2 flex justify-between font-bold text-md">
                            <span>Estimated Total</span>
                            <span className="font-mono">{formatPrice(total)}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><GanttChartSquare className="h-5 w-5 text-primary"/>Inventory Check</CardTitle>
                        <CardDescription>Automated stock check for the requested period.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {availability.length > 0 ? (
                            <ul className="space-y-3">
                                {availability.map(item => {
                                    const StatusIcon = inventoryStatusStyles[item.status].icon;
                                    const statusStyle = inventoryStatusStyles[item.status].style;
                                    return (
                                        <li key={item.name} className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2">
                                                <StatusIcon className={cn("h-4 w-4", statusStyle)} />
                                                {item.name}
                                            </span>
                                            <span className="font-mono text-muted-foreground">{item.required} required / {item.available < 0 ? 0 : item.available} available</span>
                                        </li>
                                    );
                                })}
                            </ul>
                         ) : <p className="text-sm text-muted-foreground text-center py-4">No trackable items in this request.</p>}
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" />Customer & Delivery</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><span className="font-semibold">Name:</span> {customerName}</div>
                        <div><span className="font-semibold">Email:</span> {customerEmail}</div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="font-semibold">Rental Period:</p>
                            <p className="text-muted-foreground">{new Date(rentalStartDate).toLocaleDateString()} - {new Date(rentalEndDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Box Protection:</p>
                            <p className="text-muted-foreground">{stakitShield ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold">Drop-off Address:</p>
                        <p className="text-muted-foreground">{dropOffAddress}</p>
                    </div>
                     <div>
                        <p className="font-semibold">Collection Address:</p>
                        <p className="text-muted-foreground">
                            {collectionAddress === dropOffAddress ? <em>Same as drop-off</em> : collectionAddress}
                        </p>
                    </div>
                    {deliveryConfirmationTimestamp ? (
                        <div>
                            <p className="font-semibold text-green-600 flex items-center gap-2"><CheckCircle /> Delivery Confirmed</p>
                            <p className="text-muted-foreground">{new Date(deliveryConfirmationTimestamp).toLocaleString()}</p>
                        </div>
                    ) : (
                        <div>
                             <p className="font-semibold">Delivery Confirmation</p>
                             <p className="text-muted-foreground">Not yet confirmed by customer.</p>
                        </div>
                    )}
                    {projectDescription && (
                        <div>
                            <p className="font-semibold">Additional Information:</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">{projectDescription}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            {status === 'Completed' && <LogDamageForm request={request} onSave={onDamageLogged} />}
            <EvidenceSection customerId={request.customerId} quoteId={request.id} />
        </div>
    );
}

function QuoteRequestList({ requests, allRequests, inventory, onStatusChange, onEditQuote, onConfirmDelivery, onDamageLogged }: { requests: QuoteRequestWithId[]; allRequests: QuoteRequestWithId[]; inventory: InventoryItem[]; onStatusChange: (quoteId: string, customerId: string, status: QuoteRequestWithId['status']) => void; onEditQuote: (quote: QuoteRequestWithId) => void; onConfirmDelivery: (quote: QuoteRequestWithId) => void; onDamageLogged: () => void; }) {
    return (
         <Accordion type="single" collapsible className="w-full space-y-4">
            {requests.length > 0 ? requests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
                <AccordionItem value={request.id} className="border-b-0">
                    <AccordionTrigger className="p-4 hover:no-underline hover:bg-muted/50 data-[state=open]:bg-muted/50 text-sm">
                         <div className="flex items-center gap-4 text-left w-full">
                            <Badge variant="outline" className={cn("hidden sm:inline-flex", quoteStatusStyles[request.status])}>{request.status}</Badge>
                            <div className="flex-1">
                                <p className="font-semibold">{request.customerName}</p>
                                <p className="text-xs text-muted-foreground">{request.projectDescription || `Request ID: ${request.id}`}</p>
                            </div>
                            <div className="hidden md:block text-muted-foreground">
                                {new Date(request.submittedDate).toLocaleDateString()}
                            </div>
                         </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <QuoteRequestDetails request={request} allRequests={allRequests} inventory={inventory} onDamageLogged={onDamageLogged}/>
                        <div className="flex justify-end gap-2 p-4 border-t bg-background">
                             { (request.status === 'Paid' || request.status === 'Delivered') && !request.deliveryConfirmationTimestamp && (
                                <Button variant="secondary" onClick={() => onConfirmDelivery(request)}>
                                    <QrCode className="mr-2 h-4 w-4" /> Request Confirmation
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => onEditQuote(request)}>
                                <Edit className="mr-2 h-4 w-4"/> Edit Quote
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        Update Status <MoreHorizontal className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                    {Object.keys(quoteStatusStyles).map((status) => (
                                        <DropdownMenuItem key={status} onClick={() => onStatusChange(request.id, request.customerId, status as QuoteRequestWithId['status'])} disabled={request.status === status}>
                                            <Circle className={cn("mr-2 h-2 w-2", quoteStatusStyles[status])} />
                                            {status}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button disabled={request.status === 'Approved'} onClick={() => onStatusChange(request.id, request.customerId, 'Approved')}>
                                <CheckCircle className="mr-2 h-4 w-4"/> Approve
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Card>
            )) : (
                 <div className="text-center py-12 text-muted-foreground">
                    <Package className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">No requests found</h3>
                    <p className="mt-1 text-sm">There are no quote requests matching the current filter.</p>
                </div>
            )}
        </Accordion>
    );
}

function ContactMessageList({ messages, onStatusChange }: { messages: ContactMessageWithId[], onStatusChange: (messageId: string, status: ContactMessageWithId['status']) => void }) {
    const [filter, setFilter] = useState<'New' | 'Read' | 'Archived' | 'All'>('New');

    const filteredMessages = useMemo(() => {
        if (filter === 'All') return messages;
        return messages.filter(m => m.status === filter);
    }, [messages, filter]);

    return (
        <Card>
            <CardHeader className="flex-row justify-between items-center">
                <div>
                    <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary"/>Contact Messages</CardTitle>
                    <CardDescription>Inquiries submitted through the contact form.</CardDescription>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Filter: {filter}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setFilter('All')}>All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilter('New')}>New</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilter('Read')}>Read</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilter('Archived')}>Archived</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                {filteredMessages.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full space-y-2">
                        {filteredMessages.map(message => (
                            <AccordionItem key={message.id} value={message.id} className="border rounded-lg">
                                <AccordionTrigger className="p-3 hover:no-underline data-[state=open]:border-b text-sm">
                                    <div className="flex items-center gap-4 w-full">
                                        <Badge variant="outline" className={cn(messageStatusStyles[message.status])}>{message.status}</Badge>
                                        <div className="flex-1 text-left">
                                            <p className="font-semibold">{message.name}</p>
                                            <p className="text-xs text-muted-foreground">{message.email}</p>
                                        </div>
                                        <div className="hidden sm:block text-xs text-muted-foreground">
                                            {new Date(message.submittedDate).toLocaleString()}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 space-y-4">
                                    <p className="whitespace-pre-wrap">{message.message}</p>
                                    <div className="flex justify-end gap-2 pt-2">
                                        {message.status !== 'Read' && <Button variant="outline" size="sm" onClick={() => onStatusChange(message.id, 'Read')}><Eye className="mr-2 h-4 w-4"/>Mark as Read</Button>}
                                        {message.status !== 'Archived' && <Button variant="outline" size="sm" onClick={() => onStatusChange(message.id, 'Archived')}><Archive className="mr-2 h-4 w-4"/>Archive</Button>}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <p className="text-center py-8 text-muted-foreground">No messages matching this filter.</p>
                )}
            </CardContent>
        </Card>
    );
}

function InventoryManagement({ initialInventory, onSave, onRetire }: { initialInventory: InventoryItem[]; onSave: (itemId: string, data: Partial<InventoryItem>) => void; onRetire: (quantity: number, notes?: string) => Promise<boolean>; }) {
    const [inventory, setInventory] = useState(initialInventory);
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [isRetireDialogOpen, setRetireDialogOpen] = useState(false);

    useEffect(() => {
        setInventory(initialInventory);
    }, [initialInventory]);

    const handleQuantityChange = (itemId: string, change: number) => {
        setInventory(current =>
            current.map(item =>
                item.id === itemId
                    ? { ...item, quantity: Math.max(0, item.quantity + change) }
                    : item
            )
        );
    };

    const handleSave = async (item: InventoryItem) => {
        setIsSaving(item.id);
        await onSave(item.id, { name: item.name, type: item.type, quantity: item.quantity });
        setIsSaving(null);
    };

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2"><Warehouse className="h-5 w-5 text-primary"/>Inventory Management</CardTitle>
                    <CardDescription>Set and update the total quantity of your rental stock.</CardDescription>
                </div>
                <div>
                    <Button variant="destructive" onClick={() => setRetireDialogOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Retire Crates</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {inventory.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <p className="font-semibold">{item.name}</p>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, -1)}><Minus className="h-4 w-4"/></Button>
                                <Input value={item.quantity} className="h-8 w-16 text-center" readOnly />
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, 1)}><Plus className="h-4 w-4"/></Button>
                                <Button size="sm" onClick={() => handleSave(item)} disabled={isSaving === item.id}>
                                    {isSaving === item.id && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Save
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <RetireCratesDialog isOpen={isRetireDialogOpen} onOpenChange={setRetireDialogOpen} onRetire={onRetire} />
        </Card>
    )
}

function RetireCratesDialog({ isOpen, onOpenChange, onRetire }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onRetire: (quantity: number, notes?: string) => Promise<boolean> }) {
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const success = await onRetire(quantity, notes);
        if (success) {
            setQuantity(1);
            setNotes('');
            onOpenChange(false);
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Retire Moving Crates</DialogTitle>
                    <DialogDescription>
                        Log crates that are being permanently removed from circulation due to damage or loss. This will update your total inventory count.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="retire-quantity">Quantity to Retire</Label>
                        <Input id="retire-quantity" type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="retire-notes">Notes (Optional)</Label>
                        <Textarea id="retire-notes" placeholder="e.g., Crate lost on order #123, 2 crates cracked during move." value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Retire Items
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function LogDamageForm({ request, onSave }: { request: QuoteRequestWithId, onSave: () => void }) {
    const { idToken } = useUser();
    const { toast } = useToast();
    const [damagedCrates, setDamagedCrates] = useState<number | string>(request.damagedCrates || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        if (!idToken) return;
        const numCrates = parseInt(String(damagedCrates), 10);
        if (isNaN(numCrates) || numCrates < 0) {
            toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please enter a valid number.'});
            return;
        }
        setIsSubmitting(true);
        const result = await updateQuoteDetails(idToken, {
            customerId: request.customerId,
            quoteId: request.id,
            data: { damagedCrates: numCrates }
        });

        if (result.success) {
            toast({ title: 'Damage Logged', description: `Successfully logged ${numCrates} damaged crates.`});
            onSave();
        } else {
            toast({ variant: 'destructive', title: 'Save Failed', description: result.error });
        }
        setIsSubmitting(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Log Damaged Crates</CardTitle>
                <CardDescription>
                    Record the number of crates returned damaged for this completed order.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <Input
                    type="number"
                    value={damagedCrates}
                    onChange={(e) => setDamagedCrates(e.target.value)}
                    placeholder="e.g., 2"
                    className="max-w-xs"
                />
                 <Button onClick={handleSave} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Log
                </Button>
            </CardContent>
        </Card>
    );
}

function EvidenceUploader({ customerId, quoteId, category }: { customerId: string; quoteId: string; category: OrderEvidence['category'] }) {
    const { storage, firestore, user } = useFirebase();
    const { toast } = useToast();
    const [uploadingFile, setUploadingFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setUploadingFile(file);
        setUploadProgress(0);

        const uniqueFileName = `${crypto.randomUUID()}-${file.name}`;
        const fileRef = storageRef(storage, `evidence/${customerId}/${quoteId}/${uniqueFileName}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
                setUploadingFile(null);
                setUploadProgress(0);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                const evidenceDoc: Omit<OrderEvidenceWithId, 'id'> = {
                    url: downloadURL,
                    fileName: file.name,
                    mimeType: file.type,
                    category,
                    uploadedAt: serverTimestamp(),
                    uploadedBy: user.uid,
                };
                
                const evidenceColRef = collection(firestore, 'customers', customerId, 'quoteRequests', quoteId, 'evidence');
                addDocumentNonBlocking(evidenceColRef, evidenceDoc);

                toast({ title: 'Upload Complete', description: `${file.name} has been saved.` });
                setUploadingFile(null);
                setUploadProgress(0);
                 if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        );
    };

    return (
        <div className="mt-4">
             <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={!!uploadingFile}>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload {category === 'report' ? 'Document' : 'Photo'}
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept={category === 'report' ? '.doc,.docx,.pdf' : 'image/*'} />
            
            {uploadingFile && (
                <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-sm">
                        <p className="text-muted-foreground truncate">{uploadingFile.name}</p>
                        <p className="font-mono">{Math.round(uploadProgress)}%</p>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                </div>
            )}
        </div>
    );
}

function EvidenceSection({ customerId, quoteId }: { customerId: string, quoteId: string }) {
    const { firestore } = useFirebase();
    
    const evidenceQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'customers', customerId, 'quoteRequests', quoteId, 'evidence');
    }, [firestore, customerId, quoteId]);
    
    const { data: evidence, isLoading } = useCollection<OrderEvidenceWithId>(evidenceQuery);

    const categorizedEvidence = useMemo(() => {
        const categories: { [key in OrderEvidence['category']]: OrderEvidenceWithId[] } = {
            'drop-off': [],
            'collection': [],
            'damage': [],
            'report': [],
        };
        evidence?.forEach(item => {
            if (categories[item.category]) {
                categories[item.category].push(item);
            }
        });
        return categories;
    }, [evidence]);

    const EvidenceList = ({ items, category }: { items: OrderEvidenceWithId[], category: OrderEvidence['category'] }) => {
        if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
        if (items.length === 0) return <p className="text-sm text-muted-foreground text-center py-4">No {category === 'report' ? 'documents' : 'photos'} uploaded yet.</p>

        return (
            <div className={cn("grid gap-4", category === 'report' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4')}>
                {items.sort((a,b) => {
                    const dateA = a.uploadedAt?.toDate ? a.uploadedAt.toDate().getTime() : 0;
                    const dateB = b.uploadedAt?.toDate ? b.uploadedAt.toDate().getTime() : 0;
                    return dateB - dateA;
                }).map(item => {
                    const displayDate = item.uploadedAt?.toDate ? item.uploadedAt.toDate().toLocaleString() : "Processing...";
                    return (
                        <div key={item.id} className="group relative">
                            {item.mimeType.startsWith('image/') ? (
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="block w-full aspect-square relative rounded-md overflow-hidden border">
                                    <Image src={item.url} alt={item.fileName} fill className="object-cover transition-transform group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                </a>
                            ) : (
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 aspect-square rounded-md border bg-muted hover:bg-muted/80">
                                    <Paperclip className="h-10 w-10 text-muted-foreground" />
                                </a>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-2 text-white bg-black/50 text-xs">
                                <p className="font-semibold truncate">{item.fileName}</p>
                                <p className="opacity-80">{displayDate}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Order Documentation</CardTitle>
                <CardDescription>Upload and view photos and documents for this order. Records are immutable.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="drop-off">
                    <TabsList>
                        <TabsTrigger value="drop-off">Drop-off Photos</TabsTrigger>
                        <TabsTrigger value="collection">Collection Photos</TabsTrigger>
                        <TabsTrigger value="damage">Damage Photos</TabsTrigger>
                        <TabsTrigger value="report">Condition Reports</TabsTrigger>
                    </TabsList>
                    <TabsContent value="drop-off" className="pt-4">
                        <EvidenceList items={categorizedEvidence['drop-off']} category="drop-off" />
                        <EvidenceUploader customerId={customerId} quoteId={quoteId} category="drop-off" />
                    </TabsContent>
                    <TabsContent value="collection" className="pt-4">
                        <EvidenceList items={categorizedEvidence['collection']} category="collection" />
                        <EvidenceUploader customerId={customerId} quoteId={quoteId} category="collection" />
                    </TabsContent>
                     <TabsContent value="damage" className="pt-4">
                        <EvidenceList items={categorizedEvidence['damage']} category="damage" />
                        <EvidenceUploader customerId={customerId} quoteId={quoteId} category="damage" />
                    </TabsContent>
                     <TabsContent value="report" className="pt-4">
                        <EvidenceList items={categorizedEvidence['report']} category="report" />
                        <EvidenceUploader customerId={customerId} quoteId={quoteId} category="report" />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function AnalyticsDashboard({ requests, inventory, activity }: { requests: QuoteRequestWithId[]; inventory: InventoryItem[]; activity: InventoryActivityWithId[]; }) {
    const formatPrice = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

    const analytics = useMemo(() => {
        const paidQuotes = requests.filter(r => r.status === 'Paid' || r.status === 'Completed');
        const totalRevenue = paidQuotes.reduce((acc, r) => {
            const { total } = calculateQuoteTotal(r.items, r.rentalStartDate, r.rentalEndDate, r.stakitShield);
            return acc + total;
        }, 0);

        const totalDamagedCrates = requests.reduce((acc, r) => acc + (r.damagedCrates || 0), 0);
        const totalRentedCrates = requests.reduce((acc, r) => {
            const trackables = getTrackableItemsFromQuote(r.items);
            return acc + (trackables.get('crates') || 0);
        }, 0);

        const damageRate = totalRentedCrates > 0 ? (totalDamagedCrates / totalRentedCrates) * 100 : 0;
        
        const itemPopularity = requests.flatMap(r => r.items).reduce((acc, item) => {
            acc[item.name] = (acc[item.name] || 0) + item.quantity;
            return acc;
        }, {} as { [key: string]: number });

        const sortedItemPopularity = Object.entries(itemPopularity).sort(([, a], [, b]) => b - a).slice(0, 10);
        
        const retiredCrates = activity.filter(a => a.itemId === 'crates' && a.type === 'retire').reduce((acc, a) => acc + a.quantity, 0);

        return {
            totalRevenue,
            avgOrderValue: paidQuotes.length > 0 ? totalRevenue / paidQuotes.length : 0,
            totalRentals: paidQuotes.length,
            totalDamagedCrates,
            damageRate,
            itemPopularity: sortedItemPopularity,
            retiredCrates,
        };
    }, [requests, activity]);

    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(analytics.totalRevenue)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(analytics.avgOrderValue)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Damaged Crates</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalDamagedCrates}</div>
                        <p className="text-xs text-muted-foreground">{analytics.damageRate.toFixed(2)}% of all rented crates</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Retired Crates</CardTitle>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.retiredCrates}</div>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Top 10 Rented & Sold Items</CardTitle>
                    <CardDescription>Shows the most popular items across all orders.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={analytics.itemPopularity.map(([name, total]) => ({ name, total }))}>
                             <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} angle={-45} textAnchor="end" interval={0} height={80}/>
                             <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                             <RechartsTooltip />
                             <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

// --- MAIN ADMIN COMPONENT ---

export default function AdminDashboard() {
    const { idToken } = useUser();
    const { toast } = useToast();
    const { isAdmin, isCheckingAdmin } = useAdmin();

    const [isLoading, setIsLoading] = useState(true);
    const [requests, setRequests] = useState<QuoteRequestWithId[]>([]);
    const [messages, setMessages] = useState<ContactMessageWithId[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [inventoryActivity, setInventoryActivity] = useState<InventoryActivityWithId[]>([]);
    const [editingQuote, setEditingQuote] = useState<QuoteRequestWithId | null>(null);
    const [confirmingQuote, setConfirmingQuote] = useState<QuoteRequestWithId | null>(null);
    
    const [filter, setFilter] = useState<'Pending' | 'In Review' | 'Approved' | 'All'>('Pending');

    const fetchData = useCallback(async () => {
        if (!idToken) return;
        setIsLoading(true);
        try {
            const [reqResult, msgResult, invResult, activityResult] = await Promise.all([
                getAdminQuoteRequests(idToken),
                getContactMessages(idToken),
                getInventory(idToken),
                getInventoryActivity(idToken),
            ]);

            if (reqResult.success) {
                const sortedRequests = reqResult.data.sort((a, b) => {
                    const dateA = a.submittedDate ? new Date(a.submittedDate).getTime() : 0;
                    const dateB = b.submittedDate ? new Date(b.submittedDate).getTime() : 0;
                    return dateB - dateA;
                });
                setRequests(sortedRequests);
            } else {
                throw new Error(reqResult.error);
            }
            
            if (msgResult.success) setMessages(msgResult.data);
            else throw new Error(msgResult.error);
            
            if (invResult.success) setInventory(invResult.data);
            else throw new Error(invResult.error);

            if (activityResult.success) setInventoryActivity(activityResult.data);
            else throw new Error(activityResult.error);
            
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error fetching data', description: error.message });
        } finally {
            setIsLoading(false);
        }
    }, [idToken, toast]);

    useEffect(() => {
        if (isAdmin) {
            fetchData();
        }
    }, [isAdmin, fetchData]);
    
    const allPossibleInventoryItems = useMemo((): InventoryItem[] => {
        return [
            { id: 'crates', name: 'Moving Crates', quantity: 0, type: 'crate_pool' },
            ...otherServices.filter(s => s.trackInventory).map(s => ({ id: s.id, name: s.name, quantity: 0, type: 'item' as const })),
            ...inventoryTrackedMattressProtectors.filter(s => s.trackInventory).map(s => ({ id: s.id, name: s.name, quantity: 0, type: 'item' as const })),
            ...inventoryTrackedReusableProtectors.filter(s => s.trackInventory).map(s => ({ id: s.id, name: s.name, quantity: 0, type: 'item' as const })),
            ...inventoryTrackedTvProtectionAddOns.filter(s => s.trackInventory).map(s => ({ id: s.id, name: s.name, quantity: 0, type: 'item' as const })),
        ];
    }, []);

    const mergedInventory = useMemo(() => {
        return allPossibleInventoryItems.map(possibleItem => {
            const existingItem = inventory.find(i => i.id === possibleItem.id);
            return existingItem ? { ...possibleItem, ...existingItem } : possibleItem;
        });
    }, [inventory, allPossibleInventoryItems]);

    const handleUpdateStatus = async (quoteId: string, customerId: string, status: QuoteRequestWithId['status']) => {
        if (!idToken) return;
        const originalStatus = requests.find(r => r.id === quoteId)?.status;
        setRequests(prev => prev.map(r => r.id === quoteId ? { ...r, status } : r));
        
        const result = await updateQuoteStatus(idToken, { quoteId, customerId, status });
        if (!result.success) {
            toast({ variant: 'destructive', title: 'Failed to update', description: result.error });
            setRequests(prev => prev.map(r => r.id === quoteId ? { ...r, status: originalStatus! } : r));
        } else {
             toast({ title: 'Status Updated', description: `Quote ${quoteId} has been set to ${status}.` });
             fetchData();
        }
    };

    const handleUpdateMessageStatus = async (messageId: string, status: ContactMessageWithId['status']) => {
        if(!idToken) return;
        const originalStatus = messages.find(m => m.id === messageId)?.status;
        setMessages(prev => prev.map(m => m.id === messageId ? {...m, status} : m));

        const result = await updateMessageStatus(idToken, { messageId, status });
        if(!result.success) {
            toast({ variant: 'destructive', title: 'Failed to update message', description: result.error });
            setMessages(prev => prev.map(m => m.id === messageId ? {...m, status: originalStatus!} : m));
        } else {
            toast({ title: 'Message Updated' });
            fetchData();
        }
    };

    const handleInventorySave = async (itemId: string, data: Partial<InventoryItem>) => {
        if (!idToken) return;
        const result = await setInventoryItem(idToken, { itemId, data });
        if(result.success) {
            toast({ title: 'Inventory Saved', description: `Item ${itemId} has been updated.`});
            fetchData(); // Refresh all data
        } else {
            toast({ variant: 'destructive', title: 'Failed to save inventory', description: result.error });
        }
    };

    const handleCrateRetirement = async (quantity: number, notes?: string): Promise<boolean> => {
        if (!idToken) return false;
        const result = await logCrateRetirement(idToken, { quantity, notes });
        if (result.success) {
            toast({ title: 'Crates Retired', description: `${quantity} crates have been removed from inventory.` });
            fetchData();
            return true;
        } else {
            toast({ variant: 'destructive', title: 'Retirement Failed', description: result.error });
            return false;
        }
    };

    const handleSaveQuote = async (quoteData: any) => {
        if (!idToken || !editingQuote) return;

        const result = await updateQuoteDetails(idToken, {
            customerId: editingQuote.customerId,
            quoteId: editingQuote.id,
            data: quoteData,
        });

        if (result.success) {
            toast({ title: 'Quote Updated', description: 'The customer quote has been successfully saved.' });
            setEditingQuote(null);
            fetchData(); // Refresh data to show changes
        } else {
            toast({ variant: 'destructive', title: 'Update Failed', description: result.error });
        }
    };

    const filteredRequests = useMemo(() => {
        if (filter === 'All') return requests;
        return requests.filter(r => r.status === filter);
    }, [requests, filter]);

    if (isCheckingAdmin || isLoading) {
        return <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    if (!isAdmin) {
        return <Card><CardHeader><CardTitle>Access Denied</CardTitle><CardDescription>You do not have permission to view this page.</CardDescription></CardHeader></Card>;
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage your rental business from one central hub.</p>
            </header>

            <Tabs defaultValue="overview">
                 <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
                    <TabsTrigger value="overview"><BarChart2 className="mr-2 h-4 w-4"/>Overview</TabsTrigger>
                    <TabsTrigger value="analytics"><BarChartBig className="mr-2 h-4 w-4"/>Analytics</TabsTrigger>
                    <TabsTrigger value="requests"><ClipboardList className="mr-2 h-4 w-4"/>Requests</TabsTrigger>
                    <TabsTrigger value="schedule"><CalendarIcon className="mr-2 h-4 w-4"/>Schedule</TabsTrigger>
                    <TabsTrigger value="messages"><MessageSquare className="mr-2 h-4 w-4"/>Messages</TabsTrigger>
                    <TabsTrigger value="inventory"><Warehouse className="mr-2 h-4 w-4"/>Inventory</TabsTrigger>
                 </TabsList>
                 <TabsContent value="overview" className="mt-6 space-y-6">
                    <OverviewSection requests={requests} messages={messages} />
                    <LiveRentalsSection requests={requests} />
                 </TabsContent>
                 <TabsContent value="analytics" className="mt-6">
                    <AnalyticsDashboard requests={requests} inventory={inventory} activity={inventoryActivity} />
                 </TabsContent>
                 <TabsContent value="requests" className="mt-6">
                    <Card>
                        <CardHeader className="flex-row justify-between items-center">
                            <div>
                                <CardTitle>Quote Requests</CardTitle>
                                <CardDescription>Review, approve, or reject incoming customer requests.</CardDescription>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">Filter: {filter}</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setFilter('All')}>All</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilter('Pending')}>Pending</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilter('In Review')}>In Review</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilter('Approved')}>Approved</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent>
                             <QuoteRequestList 
                                requests={filteredRequests} 
                                allRequests={requests} 
                                inventory={inventory} 
                                onStatusChange={handleUpdateStatus}
                                onEditQuote={(quote) => setEditingQuote(quote)}
                                onConfirmDelivery={(quote) => setConfirmingQuote(quote)}
                                onDamageLogged={fetchData}
                              />
                        </CardContent>
                    </Card>
                 </TabsContent>
                 <TabsContent value="schedule" className="mt-6">
                    <RentalCalendar requests={requests} />
                 </TabsContent>
                 <TabsContent value="messages" className="mt-6">
                    <ContactMessageList messages={messages} onStatusChange={handleUpdateMessageStatus} />
                 </TabsContent>
                 <TabsContent value="inventory" className="mt-6">
                    <InventoryManagement initialInventory={mergedInventory} onSave={handleInventorySave} onRetire={handleCrateRetirement} />
                 </TabsContent>
            </Tabs>

            <Dialog open={!!editingQuote} onOpenChange={(isOpen) => !isOpen && setEditingQuote(null)}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Edit Quote Request</DialogTitle>
                        <DialogDescription>
                            Adjust the items, dates, and details for this quote. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    {editingQuote && (
                         <EditQuoteForm
                            key={editingQuote.id}
                            quote={editingQuote}
                            onSave={handleSaveQuote}
                            onCancel={() => setEditingQuote(null)}
                          />
                    )}
                </DialogContent>
            </Dialog>

             <Dialog open={!!confirmingQuote} onOpenChange={(isOpen) => !isOpen && setConfirmingQuote(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Confirm Delivery</DialogTitle>
                        <DialogDescription>
                            Ask the customer to scan this QR code with their phone to confirm delivery.
                        </DialogDescription>
                    </DialogHeader>
                    {confirmingQuote && (
                        <div className="flex justify-center p-4">
                            <Image 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${process.env.NEXT_PUBLIC_URL}/confirm-delivery/${confirmingQuote.id}?customerId=${confirmingQuote.customerId}`)}`}
                                alt="Delivery Confirmation QR Code"
                                width={250}
                                height={250}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
