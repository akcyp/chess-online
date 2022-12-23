export type WSSendMessage =
  | {
      type: 'createGame';
      minutes: number;
      increment: number;
      private: boolean;
    }
  | {
      type: 'play';
      color: 'white' | 'black';
    };
