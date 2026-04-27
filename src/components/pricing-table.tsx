import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Service } from '@/lib/types';
import { ReactNode } from 'react';

const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
}

interface PricingTableProps {
    title: string;
    description: string;
    services: Service[];
    subheading?: string;
    footerContent?: ReactNode;
}

export function PricingTable({ title, description, services, subheading, footerContent }: PricingTableProps) {
  const hasHirePurchase = services.some(s => 'purchasePrice' in s && s.purchasePrice !== undefined);
  const hasFollowOn = services.some(s => s.followOnPrice !== undefined);

  const showHeader = title || description || subheading;

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
          {subheading && <h2 className="text-2xl font-headline font-bold text-foreground pt-4">{subheading}</h2>}
        </CardHeader>
      )}
      <CardContent className={footerContent ? 'pb-0' : ''}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Description</TableHead>
              {hasFollowOn ? (
                <>
                  <TableHead className="text-right">First Week</TableHead>
                  <TableHead className="text-right">Each Additional Week</TableHead>
                </>
              ) : hasHirePurchase ? (
                <>
                  <TableHead className="text-right">Hire Price</TableHead>
                  <TableHead className="text-right">Purchase Price</TableHead>
                </>
              ) : (
                <TableHead className="text-right">Price</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell className="text-muted-foreground">
                    {'description' in service ? service.description : ''}
                </TableCell>
                {hasFollowOn ? (
                    <>
                        <TableCell className="text-right font-semibold">{formatPrice(service.hirePrice)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatPrice(service.followOnPrice)}</TableCell>
                    </>
                ) : hasHirePurchase ? (
                    <>
                        <TableCell className="text-right font-semibold">{service.isFrom && 'from '}{formatPrice(service.hirePrice)}</TableCell>
                         <TableCell className="text-right font-semibold">{service.isFrom && 'from '}{formatPrice(service.purchasePrice)}</TableCell>
                    </>
                ): (
                    <TableCell className="text-right">
                        <span className="font-semibold">{service.priceString ? service.priceString : formatPrice(service.price ?? service.hirePrice)}</span>
                        {service.unit && service.unit !== 'hire/purchase' && (
                            <span className="text-sm text-muted-foreground">
                                {service.unit === 'hire' ? ' /hire' : `/${service.unit}`}
                            </span>
                        )}
                    </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {footerContent}
    </Card>
  );
}
