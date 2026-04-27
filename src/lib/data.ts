
import type { Service, CarouselItem, PricingBundle } from './types';
import placeholderImageData from './placeholder-images.json';

const { placeholderImages } = placeholderImageData;

const findImage = (id: string) => {
    const image = placeholderImages.find(img => img.id === id);
    if (!image) {
        return {
            imageUrl: "https://picsum.photos/seed/placeholder/600/400",
            imageHint: "placeholder"
        }
    }
    return { imageUrl: image.imageUrl, imageHint: image.imageHint };
}

export const carouselItems: CarouselItem[] = [
    {
      id: 'carousel-01',
      name: 'Moving Box Stacks',
      description: 'From studio apartments to large family homes, we have the right size stack for you.',
      ...findImage('moving-boxes')
    },
    {
      id: 'carousel-02',
      name: 'Mattress Protectors',
      description: 'Keep your mattresses clean and safe during the move with our durable protectors.',
      ...findImage('mattress-protector')
    },
    {
      "id": 'carousel-03',
      name: 'TV Protection',
      description: 'Padded sleeves and covers to protect your valuable electronics.',
      ...findImage('tv-box')
    },
    {
      id: 'carousel-04',
      name: 'Moving Blankets',
      description: 'Protect your furniture and large items from scratches and damage.',
      ...findImage('moving-blanket')
    },
    {
      id: 'carousel-05',
      name: 'Packing Paper & Bubble Wrap',
      description: 'All the essentials to keep your delicate items secure.',
      ...findImage('bubble-wrap')
    },
    {
      id: 'carousel-06',
      name: 'Hand Trolleys & Stair Climbers',
      description: 'Make moving heavy items a breeze, even up and down stairs.',
      ...findImage('hand-trolley')
    }
];

export const pricingBundles: PricingBundle[] = [
    {
        id: 'bundle-studio',
        name: 'The Studio Starter Kit',
        description: 'The perfect, no-fuss kit for getting a studio or small 1-bedroom apartment packed and moved.',
        contents: ['25 Box Stak', '1x Bubble Wrap Roll', '1x Mattress Protector - Double/Queen (Hire)'],
        price: 115,
        followOnPrice: 65,
    },
    {
        id: 'bundle-essentials',
        name: 'The Essentials Kit',
        description: 'Our recommended starting point for 1-2 bedroom homes. Get the must-haves and save.',
        contents: ['35 Box Stak', '1x Bubble Wrap Roll', '1x Mattress Protector - Double/Queen (Hire)', '1x Moving Sticker Pack'],
        price: 160,
        followOnPrice: 90,
    },
     {
        id: 'bundle-family',
        name: 'The Family Move Kit',
        description: 'The ideal choice for the average 2-3 bedroom family home. A complete package to get you started.',
        contents: ['50 Box Stak', '2x Bubble Wrap Roll', '1x Mattress Protector - Double/Queen (Hire)', '1x Mattress Protector - Single (Hire)', '1x Moving Sticker Pack'],
        price: 235,
        followOnPrice: 120,
    },
    {
        id: 'bundle-ultimate',
        name: 'The Ultimate Home Kit',
        description: 'Our all-in-one solution for large 3-4+ bedroom homes. Pack every room with confidence and save.',
        contents: ['70 Box Stak', '2x Bubble Wrap Roll', '1x Packing Paper', '1x Mattress Protector - King (Hire)', '1x Moving Sticker Pack'],
        price: 310,
        followOnPrice: 160,
    }
];

export const boxHireServices: Service[] = [
  {
    id: 'box-05',
    name: 'Single Box Hire',
    description: 'Perfect for those few extra items. Add individual boxes to any order.',
    hirePrice: 4,
    followOnPrice: 2.50,
    unit: '',
    boxCount: 1,
  },
  {
    id: 'box-01',
    name: '25 Box Stak',
    description: 'The perfect starting point for studio apartments and small 1-bedroom homes.',
    hirePrice: 105,
    followOnPrice: 65,
    unit: '',
    boxCount: 25,
  },
  {
    id: 'box-02',
    name: '35 Box Stak',
    description: 'Comfortably pack a 1-2 bedroom home with this popular, versatile stak.',
    hirePrice: 135,
    followOnPrice: 90,
    unit: '',
    boxCount: 35,
  },
  {
    id: 'box-03',
    name: '50 Box Stak',
    description: 'Our most popular choice, ideal for a typical 2-3 bedroom family home.',
    hirePrice: 195,
    followOnPrice: 120,
    unit: '',
    boxCount: 50,
  },
  {
    id: 'box-04',
    name: '70 Box Stak',
    description: 'For larger 3-4 bedroom homes, ensuring you have every room covered.',
    hirePrice: 260,
    followOnPrice: 160,
    unit: '',
    boxCount: 70,
  },
];


export const services: Service[] = [
  {
    id: 'service-01',
    name: 'Bubble Wrap Roll',
    description: '500mm x 10m',
    price: 15, // This is a purchase item, so 'price' is correct
    unit: 'roll',
    trackInventory: true,
  },
  {
    id: 'service-02',
    name: 'Packing Paper',
    description: '800mm x 580mm, 125 sheets',
    price: 15, // This is a purchase item, so 'price' is correct
    unit: 'each',
    trackInventory: true,
  },
  {
    id: 'service-03',
    name: 'Tape Roll',
    description: 'Optional for sealing wrap, not boxes',
    price: 4, // This is a purchase item, so 'price' is correct
    unit: 'each',
    trackInventory: true,
  },
  {
    id: 'service-04',
    name: 'Moving Sticker Pack',
    description: 'A comprehensive set of labels to streamline the organisation and identification of your boxes during a move.',
    price: 12, // This is a purchase item, so 'price' is correct
    unit: 'each',
    trackInventory: true,
  },
  {
    id: 'service-06',
    name: 'Moving Blanket (1.8m x 2m)',
    description: 'A protective blanket for furniture and large items.',
    hirePrice: 6,
    unit: 'hire',
    trackInventory: true,
    group: 'Moving Blanket',
  },
  {
    id: 'service-07',
    name: 'Moving Blanket (1.8m x 3.2m)',
    description: 'An extra-large blanket for bulky furniture.',
    hirePrice: 10,
    unit: 'hire',
    trackInventory: true,
    group: 'Moving Blanket',
  },
  {
    id: 'service-08',
    name: 'Insulated Cold Boxes 39L',
    description: 'Essential for safely transporting cold goods.',
    hirePrice: 8, // Changed from 'price' to 'hirePrice'
    unit: 'hire',
    trackInventory: true,
  },
  {
    id: 'service-09',
    name: 'Hand Trolley (300kg capacity)',
    description: 'Easily move heavy items and stacked boxes on flat surfaces.',
    hirePrice: 30, // Changed from 'price' to 'hirePrice'
    unit: 'hire',
    trackInventory: true,
  },
  {
    id: 'service-10',
    name: 'Stair Climber Trolley (180kg Capacity)',
    description: 'Designed to move heavy loads up and down stairs with ease.',
    hirePrice: 35, // Changed from 'price' to 'hirePrice'
    unit: 'hire',
    trackInventory: true,
  }
];

export const inventoryTrackedMattressProtectors: Service[] = [
  {
    id: 'protection-01',
    name: 'Mattress Protector - Single',
    description: 'Durable cover for single mattresses.',
    hirePrice: 5,
    purchasePrice: 8,
    unit: 'hire/purchase',
    trackInventory: true,
    group: 'Mattress Protector',
  },
  {
    id: 'protection-04',
    name: 'Mattress Protector - Double/Queen',
    description: 'A protective cover for double and queen mattresses.',
    hirePrice: 6,
    purchasePrice: 9,
    unit: 'hire/purchase',
    trackInventory: true,
    group: 'Mattress Protector',
  },
  {
    id: 'protection-02',
    name: 'Mattress Protector - King',
    description: 'Version for king-size mattresses.',
    hirePrice: 7,
    purchasePrice: 10,
    unit: 'hire/purchase',
    trackInventory: true,
    group: 'Mattress Protector',
  },
];

export const reusableProtectorSizeToIdMap: { [key: string]: string } = {
  "Single": "reusable-single",
  "King Single": "reusable-king-single",
  "Queen": "reusable-queen",
  "King": "reusable-king",
}
export const inventoryTrackedReusableProtectors: Service[] = [
   { id: 'reusable-single', name: 'Reusable Mattress Protector - Single', description: '', trackInventory: true },
   { id: 'reusable-king-single', name: 'Reusable Mattress Protector - King Single', description: '', trackInventory: true },
   { id: 'reusable-queen', name: 'Reusable Mattress Protector - Queen', description: '', trackInventory: true },
   { id: 'reusable-king', name: 'Reusable Mattress Protector - King', description: '', trackInventory: true },
];


export const protectionAddOns: Service[] = [
  ...inventoryTrackedMattressProtectors,
  {
    id: 'reusable-protector',
    name: 'Reusable Mattress Protector',
    description: 'Eco-friendly zip-close sleeve. Select sizes after choosing a quantity to hire.',
    hirePrice: 15,
    purchasePrice: 40,
    unit: 'hire/purchase',
    trackInventory: true,
    sizeOptions: Object.keys(reusableProtectorSizeToIdMap),
  },
];

export const inventoryTrackedTvProtectionAddOns: Service[] = [
  {
    id: 'tv-protection-small-1',
    name: 'TV Protector (22-24 inches)',
    description: 'Padded sleeve for TVs from 22 to 24 inches.',
    hirePrice: 20,
    purchasePrice: 40,
    trackInventory: true,
  },
  {
    id: 'tv-protection-small-2',
    name: 'TV Protector (30-32 inches)',
    description: 'Padded sleeve for TVs from 30 to 32 inches.',
    hirePrice: 20,
    purchasePrice: 40,
    trackInventory: true,
  },
    {
    id: 'tv-protection-small-3',
    name: 'TV Protector (36-38 inches)',
    description: 'Padded sleeve for TVs from 36 to 38 inches.',
    hirePrice: 20,
    purchasePrice: 40,
    trackInventory: true,
  },
  {
    id: 'tv-protection-small-4',
    name: 'TV Protector (40-42 inches)',
    description: 'Padded sleeve for TVs from 40 to 42 inches.',
    hirePrice: 20,
    purchasePrice: 40,
    trackInventory: true,
  },
  {
    id: 'tv-protection-small-5',
    name: 'TV Protector (46-48 inches)',
    description: 'Padded sleeve for TVs from 46 to 48 inches.',
    hirePrice: 20,
    purchasePrice: 40,
    trackInventory: true,
  },
  {
    id: 'tv-protection-large-1',
    name: 'TV Protector (50-52 inches)',
    description: 'Padded sleeve for TVs from 50 to 52 inches.',
    hirePrice: 28,
    purchasePrice: 60,
    trackInventory: true,
  },
    {
    id: 'tv-protection-large-2',
    name: 'TV Protector (55-58 inches)',
    description: 'Padded sleeve for TVs from 55 to 58 inches.',
    hirePrice: 28,
    purchasePrice: 60,
    trackInventory: true,
  },
  {
    id: 'tv-protection-large-3',
    name: 'TV Protector (60-65 inches)',
    description: 'Padded sleeve for TVs from 60 to 65 inches.',
    hirePrice: 28,
    purchasePrice: 60,
    trackInventory: true,
  },
    {
    id: 'tv-protection-large-4',
    name: 'TV Protector (65-70 inches)',
    description: 'Padded sleeve for TVs from 65 to 70 inches.',
    hirePrice: 28,
    purchasePrice: 60,
    trackInventory: true,
  },
];

export const tvProtectorSizeToIdMap: { [key: string]: string } = inventoryTrackedTvProtectionAddOns.reduce((acc, item) => {
  const size = item.name.match(/\(([^)]+)\)/)?.[1];
  if (size) {
    acc[size] = item.id;
  }
  return acc;
}, {} as { [key: string]: string });


export const tvProtectionAddOns: Service[] = [
  {
    id: 'tv-protector-small-group',
    name: 'TV Protector (22-48 inches)',
    description: 'Padded sleeves for small to medium TVs. Select sizes after choosing a quantity to hire.',
    hirePrice: 20,
    purchasePrice: 40,
    unit: 'hire/purchase',
    trackInventory: true,
    sizeOptions: inventoryTrackedTvProtectionAddOns
        .filter(p => p.hirePrice === 20)
        .map(p => p.name.match(/\(([^)]+)\)/)?.[1] || '')
        .filter(Boolean),
  },
  {
    id: 'tv-protector-large-group',
    name: 'TV Protector (50-70 inches)',
    description: 'Padded sleeves for large TVs. Select sizes after choosing a quantity to hire.',
    hirePrice: 28,
    purchasePrice: 60,
    unit: 'hire/purchase',
    trackInventory: true,
    sizeOptions: inventoryTrackedTvProtectionAddOns
        .filter(p => p.hirePrice === 28)
        .map(p => p.name.match(/\(([^)]+)\)/)?.[1] || '')
        .filter(Boolean),
  },
];
