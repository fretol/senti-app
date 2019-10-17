import React, { useCallback } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { MessageReply } from 'components';
import {
  CREATE_MESSAGE,
  FETCH_MESSAGE_FEED,
} from 'graphqls';
import { AnalyticsService } from 'services';

type MessageFeedResult = {
  messageFeed: {
    messages: Chatting[];
    cursor: string;
  };
};

interface Props {
  chattingId: string;
}

const Container: React.FunctionComponent<Props> = ({
  chattingId,
}) => {
  const [createMessage] = useMutation(CREATE_MESSAGE, {
    update: (cache, { data: { createMessage: { message } } }) => {
      try {
        const data = cache.readQuery<MessageFeedResult>({
          query: FETCH_MESSAGE_FEED,
          variables: {
            chattingId,
          },
        });

        if (!data) {
          return;
        }

        cache.writeQuery({
          query: FETCH_MESSAGE_FEED,
          variables: {
            chattingId,
          },
          data: {
            messageFeed: {
              ...data.messageFeed,
              messages: [message, ...data.messageFeed.messages],
            },
          },
        });
      } catch {}
    },
  });

  const create = useCallback(async (audio) => {
    await createMessage({
      variables: {
        input: {
          audio,
          chattingId,
        },
      },
    });
    AnalyticsService.logEvent('finish_create_message');
  }, [chattingId, createMessage]);

  return (
    <MessageReply
      create={create}
    />
  );
};

export default React.memo(Container);
