import type { ImageResource } from "./common";

export interface Category {

  id: number;

  name: string;

  slug: string;

  description: string;

  parentId: number;

  count: number;

  image: ImageResource | null;

  isDestination: boolean;

  destinationCode: string | null;
}

export interface Destination {

  id: number;

  code: string;

  name: string;

  slug: string;

  description: string;

  parentId: number;

  productCount: number;

  image: ImageResource | null;
}
