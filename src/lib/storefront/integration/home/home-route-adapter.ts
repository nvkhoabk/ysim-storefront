import type {
  HomePageViewModel,
} from "@/types/view-models/home";

export interface HomeRouteDataAdapter {
  readonly id: string;

  load():
    Promise<
      HomePageViewModel
    >;
}
