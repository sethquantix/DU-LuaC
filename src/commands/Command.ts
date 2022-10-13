import { SimpleMap } from "../types/SimpleMap";

export type CommandArguments = any[];
export type CommandOptions = SimpleMap<any>;

export type CommandData = {
  args: CommandArguments,
  options: CommandOptions,
};

export type CommandOptionsList = SimpleMap<{
  format: string,
  description: string,
}>;

export default interface Command {
  /**
   * The command string used to invoke this command
   */
  readonly command: string;

  /**
   * The arguments for this command
   */
  readonly args?: string[];

  /**
   * The options for this command
   */
  readonly options?: CommandOptionsList;

  /**
   * The command description
   */
  readonly description: string;

  /**
   * Runs the specified command
   * @param args The arguments for that command
   */
  run(data: CommandData): Promise<any>;
}