"use client";

import Picker, {
    EmojiClickData,
} from "emoji-picker-react";

interface EmojiPickerProps {
    open: boolean;
    onClose: () => void;
    onEmojiSelect: (emoji: string) => void;
}

export default function EmojiPicker({
    open,
    onClose,
    onEmojiSelect,
}: EmojiPickerProps) {
    if (!open) return null;

    return (
        <div className="absolute bottom-16 left-0 z-50 rounded-xl border bg-white shadow-2xl">

            <Picker
                lazyLoadEmojis
                searchDisabled={false}
                skinTonesDisabled
                previewConfig={{
                    showPreview: false,
                }}
                onEmojiClick={(
                    emoji: EmojiClickData
                ) => {
                    onEmojiSelect(
                        emoji.emoji
                    );

                    onClose();
                }}
            />

        </div>
    );
}