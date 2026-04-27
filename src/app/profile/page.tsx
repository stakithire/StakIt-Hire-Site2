
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirebase, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User as UserIcon, History } from 'lucide-react';
import { updateCustomerProfile } from './actions';
import { QuoteRequestWithId } from '@/lib/types';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';


const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email().optional(), // Email will be read-only
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


const statusStyles: { [key: string]: string } = {
  Approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
  Paid: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800',
  'In Review': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
  Rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
  Completed: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-800',
};


function QuoteHistory() {
  const { firestore, user } = useFirebase();

  const quoteRequestsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'customers', user.uid, 'quoteRequests');
  }, [firestore, user]);

  const { data: quoteRequests, isLoading } = useCollection<QuoteRequestWithId>(quoteRequestsQuery);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            My Request History
        </CardTitle>
        <CardDescription>
          A log of your past and current quote requests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {quoteRequests && quoteRequests.length > 0 ? (
          <ul className="space-y-4">
            {quoteRequests.sort((a,b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()).map(request => (
              <li key={request.id} className="p-4 rounded-lg border bg-muted/50 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                    <p className="font-semibold">{request.projectDescription || `Request from ${new Date(request.submittedDate).toLocaleDateString()}`}</p>
                    <p className="text-sm text-muted-foreground">Submitted: {new Date(request.submittedDate).toLocaleDateString()}</p>
                </div>
                 <div className="flex items-center gap-4">
                    <Badge variant="outline" className={cn('whitespace-nowrap', statusStyles[request.status])}>
                        {request.status}
                    </Badge>
                     <Button asChild variant="outline" size="sm">
                        <Link href="/tracking">View Details</Link>
                    </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-8">You have no quote requests yet.</p>
        )}
      </CardContent>
    </Card>
  );
}


export default function ProfilePage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading, idToken } = useUser();
  const { toast } = useToast();

  const customerDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'customers', user.uid);
  }, [firestore, user]);

  const { data: customerData, isLoading: isCustomerLoading } = useDoc(customerDocRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    if (customerData) {
      form.reset({
        firstName: customerData.firstName || '',
        lastName: customerData.lastName || '',
        email: customerData.email || user?.email || '',
        phone: customerData.phone || '',
        address: customerData.address || '',
      });
    } else if (user && !isCustomerLoading) {
      const nameParts = user.displayName?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

       form.reset({
        firstName: firstName,
        lastName: lastName,
        email: user.email || '',
        phone: user.phoneNumber || '',
        address: '',
      });
    }
  }, [customerData, user, isCustomerLoading, form]);


  const onSubmit = async (data: ProfileFormValues) => {
    if (!idToken || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to update your profile.' });
        return;
    }

    const result = await updateCustomerProfile(idToken, data);

    if (result.success) {
        toast({ title: 'Success', description: 'Your profile has been updated.' });
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  };
  
  const isLoading = isUserLoading || isCustomerLoading;

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading profile...</p>
        </div>
    );
  }

  if (!user || user.isAnonymous) {
      return (
          <Card className="max-w-lg mx-auto">
              <CardHeader>
                  <CardTitle>Access Denied</CardTitle>
                  <CardDescription>You must be signed in to view your profile.</CardDescription>
              </CardHeader>
          </Card>
      );
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold text-foreground">My Profile</h1>
        <p className="mt-2 text-lg text-muted-foreground">View and update your personal information.</p>
      </header>
       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary" />
                Your Details
            </CardTitle>
            <CardDescription>Keep your information up to date to ensure smooth deliveries.</CardDescription>
        </CardHeader>
        <CardContent>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your first name" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your last name" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                    </div>
                     <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input readOnly {...field} />
                            </FormControl>
                            <FormDescription>Your email address cannot be changed.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="Your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Primary Address</FormLabel>
                            <FormControl>
                                <Input placeholder="Your primary address for deliveries" {...field} />
                            </FormControl>
                             <FormDescription>
                                This will be used as the default for quote requests.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                         {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
             </Form>
        </CardContent>
       </Card>

       <QuoteHistory />
    </div>
  );
}
