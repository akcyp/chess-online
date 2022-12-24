export type WSSendMessage =
  | {
      type: 'createGame';
      minutes: number;
      increment: number;
      private: boolean;
    }
  | {
      type: 'play';
      color: 'white' | 'black' | 'exit';
    }
  | {
      type: 'move';
      from: string;
      to: string;
      promotion?: string;
    }
  | {
      type: 'ready';
      ready: boolean;
    }
  | {
      type: 'rematch';
    }
  | {
      type: 'offerdraw';
    }
  | {
      type: 'resign';
    };
