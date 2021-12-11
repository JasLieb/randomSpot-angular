import { ExternalImage } from "./external-image.model";
import { IsSelectable } from "./interactable.model";

export interface Artist extends IsSelectable {
    id: string;
    name: string;
    images: ExternalImage[];
}

export type InteractableArtist = Artist & IsSelectable;