/**
 * Represents the core User entity within the system.
 * This structure is used for profile management and session state.
 */
export interface User {
  /**
   * Unique identifier for the user (Primary Key).
   * @example 42
   */
  id: number;

  /**
   * The display name chosen by the user.
   */
  username: string;

  /**
   * The registered email address used for notifications and login.
   * @example "alex.smith@company.com"
   */
  email: string;
}
