import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";

export interface OrgMember {
  memberId: string;
  userId: string;
  name?: string | null;
  mobile: string;
  email?: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  role: string;
  roleSlug: string;
  roleId?: string;
  propertyScope: string[];
  joinedAt: string;
}

export interface AddMemberInput {
  mobile: string;
  name?: string;
  email?: string;
  roleId?: string;
  roleSlug?: string;
  propertyScope?: string[];
}

export const organizationService = {
  list: () =>
    api.get(ENDPOINTS.ORGANIZATIONS.LIST).then((r) => r.data?.data ?? r.data),

  getDetails: (id: string) =>
    api.get(ENDPOINTS.ORGANIZATIONS.DETAIL(id)).then((r) => r.data?.data ?? r.data),

  listMembers: (orgId: string) =>
    api
      .get(ENDPOINTS.ORGANIZATIONS.MEMBERS_LIST(orgId))
      .then((r) => (r.data?.data ?? r.data) as OrgMember[]),

  addMember: (orgId: string, data: AddMemberInput) =>
    api
      .post(ENDPOINTS.ORGANIZATIONS.MEMBER_ADD(orgId), data)
      .then((r) => r.data?.data ?? r.data),

  removeMember: (orgId: string, userId: string) =>
    api
      .delete(ENDPOINTS.ORGANIZATIONS.MEMBER_REMOVE(orgId, userId))
      .then((r) => r.data?.data ?? r.data),
};
