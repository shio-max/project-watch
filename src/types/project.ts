import { UniqueIdentifier } from "@dnd-kit/core";

export type Position = {
  id: number;
  name: string;
};

export type MemberItem = {
  id: UniqueIdentifier;
  memberId: string;
  positions: Position[];
};

export type ProjectContainer = {
  id: UniqueIdentifier;
  displayOrder: number;
  name: string;
  description: string;
  tags: string[];
  items: MemberItem[];
};
