/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as crons_cleanupTasks from "../crons/cleanupTasks.js";
import type * as crons from "../crons.js";
import type * as db_auth_authCodes from "../db/auth/authCodes.js";
import type * as db_auth_refreshTokens from "../db/auth/refreshTokens.js";
import type * as db_users from "../db/users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "crons/cleanupTasks": typeof crons_cleanupTasks;
  crons: typeof crons;
  "db/auth/authCodes": typeof db_auth_authCodes;
  "db/auth/refreshTokens": typeof db_auth_refreshTokens;
  "db/users": typeof db_users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
