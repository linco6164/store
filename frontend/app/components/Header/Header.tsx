"use client";

import { Container } from "../layout";

import Logo from "./Logo";
import SearchBar from "../Search/SearchBar";
import UserActions from "./UserActions";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/80 backdrop-blur-xl">

            <Container>

                <div className="flex h-20 items-center gap-8">

                    <Logo />

                    <div className="flex-1">
                        <SearchBar />
                    </div>

                    <UserActions />

                </div>

            </Container>

        </header>
    );
}