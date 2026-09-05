import { ListingCondition } from "@/app/types/listing";

export interface ConditionItem {
    value: ListingCondition;
    title: string;
    description: string;
}

export const conditions: ConditionItem[] = [
    {
        value: "new",
        title: "Nou",
        description: "Sigilat"
    },
    {
        value: "like_new",
        title: "Ca nou",
        description: "Folosit foarte puțin"
    },
    {
        value: "good",
        title: "Bun",
        description: "Uzură normală"
    },
    {
        value: "fair",
        title: "Acceptabil",
        description: "Prezintă urme de utilizare"
    }
];