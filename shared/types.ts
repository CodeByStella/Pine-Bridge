import { User, Script, TradingAccount } from './schema';

export type ScriptWithStatus = Script & {
  isActive?: boolean;
};

export type TradingAccountWithScripts = TradingAccount & {
  scripts?: Script[];
};

export type UserWithDetails = User & {
  scripts?: Script[];
  tradingAccounts?: TradingAccount[];
};

export type ActionType = 'start' | 'pause' | 'stop';

export type DeleteItemType = {
  type: 'script' | 'account' | 'user';
  id: number;
  name: string;
};

export type StatusBadgeVariants = {
  [key: string]: {
    bg: string;
    text: string;
  };
};
