"use client";

import { Fragment } from "react";

import { Message } from "../../types/chat";

import DateSeparator from "./DateSeparator";
import MessageBubble from "./MessageBubble";

interface Props {
    messages: Message[];
    currentUserId: string;
    onReply?: (message: Message) => void;
}

export default function MessageGroup({
    messages,
    currentUserId,
    onReply,
}: Props) {
    return (
        <>
            {messages.map((message, index) => {
                const previous =
                    index > 0
                        ? messages[index - 1]
                        : null;

                const next =
                    index < messages.length - 1
                        ? messages[index + 1]
                        : null;

                const showAvatar =
                    !next ||
                    next.sender._id !==
                        message.sender._id;

                const showName =
                    !previous ||
                    previous.sender._id !==
                        message.sender._id;

                const previousDate = previous
                    ? new Date(
                          previous.createdAt
                      ).toDateString()
                    : null;

                const currentDate = new Date(
                    message.createdAt
                ).toDateString();

                const showDate =
                    previousDate !== currentDate;

                return (
                    <Fragment key={message._id}>

                        {showDate && (
                            <DateSeparator
                                date={
                                    message.createdAt
                                }
                            />
                        )}

                        <MessageBubble
                            message={message}
                            currentUserId={
                                currentUserId
                            }
                            showAvatar={
                                showAvatar
                            }
                            showName={
                                showName
                            }
                            onReply={onReply}
                        />

                    </Fragment>
                );
            })}
        </>
    );
}
