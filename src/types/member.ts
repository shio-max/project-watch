export type Header = {
  title: string;
  value: keyof MemberInfo | "edit" | "delete";
};

export type MemberInfo = {
  id?: string;
  name: string;
  email: string;
  belong_to: string;
  isDeleted: boolean;
  deletedAt?: string;
};
