/**
 * Message.
 *
 * @interface Message
 * @member {string} recipient The intended recipient (address) of the message.
 * @member {string} sender The sender (address) of the message.
 * @member {string} message Message content.
 * @member {string | number} time UNIX timestamp of the message.
 */
export interface Message {
  recipient: string;
  sender: string;
  message: string;
  time?: number | string;
}
