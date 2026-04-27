
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2, Minus, Plus, ShoppingCart, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, add } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
    boxHireServices,
    services as otherServices,
    protectionAddOns,
    tvProtectionAddOns,
    pricingBundles,
} from '@/lib/data';
import { useState, useMemo, useEffect } from 'react';
import type { Service, QuoteRequestWithId } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { calculateQuoteTotal, STAKIT_SHIELD_FEE } from '@/lib/quote-calculator';
import { DialogFooter } from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const itemSchema = z.object({
    id: z.string(),
    name: z.string(),
    quantity: z.number().min(1),
    type: z.enum(['hire', 'purchase']).optional(),
    price: z.number(),
    followOnPrice: z.number().optional(),
    sizes: z.array(z.string().min(1, "Please select a size")).optional(),
});

const quoteEditFormSchema = z.object({
  projectDescription: z.string().optional(),
  dropOffAddress: z.string().min(1, 'Drop-off address is required.'),
  collectionAddress: z.string().min(1, 'Collection address is required.'),
  isSameAddress: z.boolean().optional(),
  items: z.array(itemSchema).refine((value) => value.length > 0, {
    message: 'You have to select at least one item.',
  }),
  rentalStartDate: z.date({
    required_error: 'A start date is required.',
  }),
  rentalEndDate: z.date({
    required_error: 'An end date is required.',
  }),
  stakitShield: z.boolean().optional(),
});

type QuoteEditFormValues = z.infer<typeof quoteEditFormSchema>;

const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

function QuantitySelector({ form, itemId, itemName, type, price, followOnPrice, sizeOptions }: { form: UseFormReturn<QuoteEditFormValues>, itemId: string, itemName: string, type?: 'hire' | 'purchase', price: number, followOnPrice?: number, sizeOptions?: string[] }) {
    const { control, watch } = form;
    
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "items"
    });

    const uniqueId = type ? `${itemId}-${type}` : itemId;
    const items = watch('items');
    const itemIndex = items.findIndex(item => item.id === uniqueId);
    
    const currentQuantity = itemIndex !== -1 ? items[itemIndex].quantity : 0;

    const handleQuantityChange = (change: number) => {
        const newQuantity = Math.max(0, currentQuantity + change);

        if (newQuantity === 0) {
            if (itemIndex !== -1) {
                remove(itemIndex);
            }
        } else {
            if (itemIndex === -1) {
                append({ id: uniqueId, name: itemName, quantity: newQuantity, type, price, followOnPrice, sizes: sizeOptions ? Array(newQuantity).fill('') : [] });
            } else {
                update(itemIndex, { ...items[itemIndex], quantity: newQuantity });
            }
        }
    };
    
    return (
        <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(-1)}>
                <Minus className="h-4 w-4" />
            </Button>
            <Input
                readOnly
                value={currentQuantity}
                className="h-8 w-12 text-center"
            />
            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(1)}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
}

function ItemSelector({ item, form }: { item: Service, form: UseFormReturn<QuoteEditFormValues> }) {
    const hasHire = 'hirePrice' in item && item.hirePrice !== undefined;
    const hasPurchase = 'purchasePrice' in item && item.purchasePrice !== undefined;
    const hasSizeOptions = !!item.sizeOptions && item.sizeOptions.length > 0;

    const { control, watch, setValue } = form;
    const items = watch('items');
    
    const hireId = `${item.id}-hire`;
    const hireItemIndex = items.findIndex(i => i.id === hireId);
    const hireItem = hireItemIndex !== -1 ? items[hireItemIndex] : null;

    useEffect(() => {
        if (hasSizeOptions && hireItem) {
            const currentSizes = hireItem.sizes || [];
            if (hireItem.quantity > currentSizes.length) {
                const newSizes = Array(hireItem.quantity - currentSizes.length).fill('');
                setValue(`items.${hireItemIndex}.sizes`, [...currentSizes, ...newSizes], { shouldValidate: true });
            } else if (hireItem.quantity < currentSizes.length) {
                setValue(`items.${hireItemIndex}.sizes`, currentSizes.slice(0, hireItem.quantity), { shouldValidate: true });
            }
        }
    }, [hasSizeOptions, hireItem?.quantity, hireItemIndex, setValue, item.id]);


    return (
        <div className="p-3 rounded-lg border bg-card text-card-foreground">
            <p className="font-medium">{item.name}</p>
            {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
            
            {hasHire && hasPurchase ? (
                <div className="mt-2 space-y-3">
                    {/* Hire Section */}
                    <div className="flex flex-col items-stretch gap-3">
                        <div className="flex items-center justify-between">
                            <p>Hire: {formatPrice(item.hirePrice)}</p>
                            <QuantitySelector form={form} itemId={item.id} itemName={`${item.name} (Hire)`} type="hire" price={item.hirePrice!} followOnPrice={item.followOnPrice} sizeOptions={item.sizeOptions} />
                        </div>
                        {hasSizeOptions && hireItem && hireItem.quantity > 0 && (
                            <div className="space-y-2 pt-3 pl-4 border-l">
                                <p className="text-xs font-medium text-muted-foreground">Select a size for each hired item:</p>
                                {Array.from({ length: hireItem.quantity }).map((_, index) => (
                                    <FormField
                                        key={index}
                                        control={control}
                                        name={`items.${hireItemIndex}.sizes.${index}` as const}
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue placeholder={`Item #${index + 1} Size`} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {item.sizeOptions!.map(size => (
                                                            <SelectItem key={size} value={size}>{size}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <Separator />

                    {/* Purchase Section */}
                    <div className="flex items-center justify-between">
                        <p>Purchase: {formatPrice(item.purchasePrice)}</p>
                        <QuantitySelector form={form} itemId={item.id} itemName={`${item.name} (Purchase)`} type="purchase" price={item.purchasePrice!} />
                    </div>
                </div>
            ) : hasHire ? (
                 <div className="flex items-center justify-between mt-2">
                    <p className="font-semibold">{item.priceString ? item.priceString : formatPrice(item.hirePrice)}</p>
                    <QuantitySelector form={form} itemId={item.id} itemName={item.name} type="hire" price={item.hirePrice || 0} followOnPrice={item.followOnPrice} />
                </div>
            ) : (
                 <div className="flex items-center justify-between mt-2">
                    <p className="font-semibold">{item.priceString ? item.priceString : formatPrice(item.price)}</p>
                    <QuantitySelector form={form} itemId={item.id} itemName={item.name} price={item.price || 0} />
                </div>
            )}
        </div>
    );
}

function ItemGroupOption({ item, groupName, form, showFollowOnPrice }: { item: Service, groupName: string, form: UseFormReturn<QuoteEditFormValues>, showFollowOnPrice: boolean }) {
    const optionLabel = item.name.replace(groupName, '').replace('Protector', '').trim();

    const hasHire = 'hirePrice' in item && item.hirePrice !== undefined;
    const hasPurchase = 'purchasePrice' in item && item.purchasePrice !== undefined;

    return (
        <div className="border-t pt-3 first:border-t-0 first:pt-0">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <p className="font-medium text-sm">{optionLabel.replace(/[()]/g, '')}</p>
                    {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                </div>

                <div className="shrink-0 text-sm">
                     {hasHire && hasPurchase ? (
                        <div className="space-y-2">
                             <div className="flex items-center justify-end gap-2">
                                <p className="font-semibold text-right">Hire: {formatPrice(item.hirePrice)}</p>
                                <QuantitySelector form={form} itemId={item.id} itemName={`${item.name} (Hire)`} type="hire" price={item.hirePrice!} followOnPrice={item.followOnPrice} />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <p className="font-semibold text-right">Buy: {formatPrice(item.purchasePrice)}</p>
                                <QuantitySelector form={form} itemId={item.id} itemName={`${item.name} (Purchase)`} type="purchase" price={item.purchasePrice!} />
                            </div>
                        </div>
                    ) : hasHire ? (
                        <div className="flex items-center justify-end gap-2">
                            <div className="text-right">
                                <p className="font-semibold">{formatPrice(item.hirePrice)}</p>
                                {showFollowOnPrice && item.followOnPrice && (
                                    <p className="text-xs text-muted-foreground">({formatPrice(item.followOnPrice)}/xtra wk)</p>
                                )}
                            </div>
                            <QuantitySelector form={form} itemId={item.id} itemName={item.name} type="hire" price={item.hirePrice!} followOnPrice={item.followOnPrice} />
                        </div>
                    ) : (
                         <div className="flex items-center justify-end gap-2">
                            <p className="font-semibold">{formatPrice(item.price)}</p>
                            <QuantitySelector form={form} itemId={item.id} itemName={item.name} price={item.price!} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ItemGroupSelector({ groupName, items, form, showFollowOnPrice }: { groupName: string, items: Service[], form: UseFormReturn<QuoteEditFormValues>, showFollowOnPrice: boolean }) {
    return (
        <div className="p-4 rounded-lg border bg-card text-card-foreground">
            <p className="font-semibold mb-2">{groupName}</p>
            <div className="space-y-3">
                {items.map(item => <ItemGroupOption key={item.id} item={item} groupName={groupName} form={form} showFollowOnPrice={showFollowOnPrice} />)}
            </div>
        </div>
    );
}

function ItemList({ items, form, subheading, showFollowOnPrice }: { form: UseFormReturn<QuoteEditFormValues>, items: Service[], subheading?: string, showFollowOnPrice: boolean }) {
    
    const groupedItems = useMemo(() => {
        const groups: { [key: string]: Service[] } = {};
        const singles: Service[] = [];

        items.forEach(item => {
            if (item.group) {
                if (!groups[item.group]) {
                    groups[item.group] = [];
                }
                groups[item.group].push(item);
            } else {
                singles.push(item);
            }
        });
        
        return { groups, singles };
    }, [items]);
    
    return (
        <div>
            {subheading && <h3 className="text-md font-semibold mb-2">{subheading}</h3>}
            <div className="space-y-4">
                {Object.entries(groupedItems.groups).map(([groupName, groupItems]) => (
                    <ItemGroupSelector key={groupName} groupName={groupName} items={groupItems} form={form} showFollowOnPrice={showFollowOnPrice} />
                ))}
                {groupedItems.singles.map((item) => (
                    <ItemSelector key={item.id} item={item} form={form} />
                ))}
            </div>
        </div>
    )
}

function QuoteSummary({ form }: { form: UseFormReturn<QuoteEditFormValues> }) {
    const { items, rentalStartDate, rentalEndDate, stakitShield } = form.watch();

    const totalItems = useMemo(() => {
        return Array.isArray(items) ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;
    }, [items]);

    const calculation = useMemo(() => {
        return calculateQuoteTotal(items, rentalStartDate, rentalEndDate, stakitShield);
    }, [items, rentalStartDate, rentalEndDate, stakitShield]);

    const { subtotal, extensionFee, extraWeeks, deliveryFee, stakitShieldFee, total } = calculation;

    return (
        <div className="sticky top-0 space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                    <div>
                        <CardTitle>Updated Quote</CardTitle>
                        <CardDescription>Real-time calculation of changes.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {totalItems > 0 ? (
                        <ul className="space-y-3 text-sm">
                            {items.map((item, index) => (
                                <li key={`${item.id}-${index}`}>
                                     <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">{item.name}</span>
                                        <span className="font-medium">Qty: {item.quantity}</span>
                                    </div>
                                    {item.sizes && item.sizes.length > 0 && (
                                        <div className="text-xs text-muted-foreground/80 pl-2">
                                            ({item.sizes.filter(s => s).join(', ') || 'Sizes not specified'})
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Select items to add them to the quote.</p>
                    )}
                </CardContent>
                {totalItems > 0 && (
                    <CardFooter className="flex-col items-stretch space-y-2">
                        <Separator className="mb-2" />
                         <div className="flex justify-between w-full text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between w-full text-sm">
                            <span className="text-muted-foreground">Delivery & Collection Fee</span>
                            <span>{formatPrice(deliveryFee)}</span>
                        </div>
                         {extensionFee > 0 && (
                            <div className="flex justify-between w-full text-sm">
                                <span className="text-muted-foreground">Rental Extension ({extraWeeks} extra {extraWeeks > 1 ? 'weeks' : 'week'})</span>
                                <span>{formatPrice(extensionFee)}</span>
                            </div>
                        )}
                        {stakitShieldFee > 0 && (
                             <div className="flex justify-between w-full text-sm">
                                <span className="text-muted-foreground">Box Protection Plan</span>
                                <span>{formatPrice(stakitShieldFee)}</span>
                            </div>
                        )}
                        <Separator className="my-2" />
                         <div className="flex justify-between w-full font-bold text-lg">
                            <span>New Estimated Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

interface EditQuoteFormProps {
    quote: QuoteRequestWithId;
    onSave: (data: QuoteEditFormValues) => Promise<void>;
    onCancel: () => void;
}

export function EditQuoteForm({ quote, onSave, onCancel }: EditQuoteFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isStartDatePickerOpen, setStartDatePickerOpen] = useState(false);
    const [isEndDatePickerOpen, setEndDatePickerOpen] = useState(false);
    const { toast } = useToast();

    const form = useForm<QuoteEditFormValues>({
        resolver: zodResolver(quoteEditFormSchema),
        defaultValues: {
            ...quote,
            rentalStartDate: new Date(quote.rentalStartDate),
            rentalEndDate: new Date(quote.rentalEndDate),
            isSameAddress: quote.dropOffAddress === quote.collectionAddress,
        },
    });

    const { isSameAddress, dropOffAddress, rentalStartDate } = form.watch();

    const showFollowOnPrice = useMemo(() => {
        const { rentalStartDate, rentalEndDate } = form.getValues();
        if (rentalStartDate && rentalEndDate && rentalEndDate > rentalStartDate) {
            const diffTime = rentalEndDate.getTime() - rentalStartDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 7;
        }
        return false;
    }, [form]);

    useEffect(() => {
        if (isSameAddress) {
            form.setValue('collectionAddress', dropOffAddress);
        }
    }, [isSameAddress, dropOffAddress, form]);


    const onSubmit = async (values: QuoteEditFormValues) => {
        setIsSubmitting(true);
        try {
            await onSave(values);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save quote.'});
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow overflow-hidden flex flex-col">
                <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 flex-grow overflow-hidden">
                    <div className="lg:col-span-2 space-y-4 overflow-y-auto pr-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Items & Dates</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <FormField
                                        control={form.control}
                                        name="rentalStartDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                            <FormLabel>Rental Start Date</FormLabel>
                                            <Popover open={isStartDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
                                                <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setStartDatePickerOpen(false); }} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name="rentalEndDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                            <FormLabel>Rental End Date</FormLabel>
                                            <Popover open={isEndDatePickerOpen} onOpenChange={setEndDatePickerOpen}>
                                                <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setEndDatePickerOpen(false); }} disabled={(date) => !rentalStartDate || date < rentalStartDate} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                      />
                                </div>
                                <div>
                                    <h3 className="text-md font-semibold mb-2">Bundles</h3>
                                    <div className="space-y-2">
                                        {pricingBundles.map((bundle) => (
                                            <div key={bundle.id} className="p-3 rounded-lg border">
                                                <p className="font-medium">{bundle.name}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="text-sm">
                                                        <p className="font-semibold">{formatPrice(bundle.price)} / first week</p>
                                                        {showFollowOnPrice && bundle.followOnPrice && (
                                                            <p className="text-xs text-muted-foreground font-normal">({formatPrice(bundle.followOnPrice)} / extra week)</p>
                                                        )}
                                                    </div>
                                                    <QuantitySelector form={form} itemId={bundle.id} itemName={bundle.name} price={bundle.price} followOnPrice={bundle.followOnPrice} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-md font-semibold mb-2">Box Hire</h3>
                                    {boxHireServices.map((item) => (
                                        <div key={item.id} className="p-3 rounded-lg border">
                                            <p className="font-medium">{item.name}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="text-sm">
                                                    <p className="font-semibold">{formatPrice(item.hirePrice)} / first week</p>
                                                    {showFollowOnPrice && item.followOnPrice && (
                                                         <p className="text-xs text-muted-foreground font-normal">({formatPrice(item.followOnPrice)} / extra week)</p>
                                                    )}
                                                </div>
                                                <QuantitySelector form={form} itemId={item.id} itemName={item.name} price={item.hirePrice || 0} followOnPrice={item.followOnPrice} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <ItemList form={form} items={otherServices} subheading="Optional Add-Ons" showFollowOnPrice={showFollowOnPrice} />
                                <ItemList form={form} items={protectionAddOns} subheading="Mattress Protection" showFollowOnPrice={showFollowOnPrice} />
                                <ItemList form={form} items={tvProtectionAddOns} subheading="TV Protection" showFollowOnPrice={showFollowOnPrice} />
                                <FormField control={form.control} name="items" render={() => ( <FormMessage className="mt-4" /> )} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Details & Delivery</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="dropOffAddress" render={({ field }) => ( <FormItem><FormLabel>Drop Off Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="collectionAddress" render={({ field }) => ( <FormItem><FormLabel>Collection Address</FormLabel><FormControl><Input {...field} disabled={isSameAddress} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="isSameAddress" render={({ field }) => ( <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Collection address is the same.</FormLabel></div></FormItem> )} />
                                <FormField control={form.control} name="projectDescription" render={({ field }) => ( <FormItem><FormLabel>Additional Information</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="stakitShield" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 bg-muted/40"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Add Box Protection Plan ({formatPrice(STAKIT_SHIELD_FEE)})</FormLabel></div></FormItem> )} />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1">
                        <QuoteSummary form={form} />
                    </div>
                </div>
                 <DialogFooter className="pt-4 mt-auto">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}

    
