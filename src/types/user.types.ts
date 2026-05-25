import { UserPlan } from "../entities/User";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
}
