import * as React from 'react';

interface LocationBubbleProps {
    location: String;
}

export default function LocationBubble({ location }: LocationBubbleProps) {
    if (location === "Title") {
        return (
            <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 "}>
                {location}
            </span>
        )
    }
    else if (location === "Star Store") {
        return (
            <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 "}>
                {location}
            </span>
        )
    } else if (location === "Redeem Shop") {
        return (
            <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 "}>
                {location}
            </span>
        )
    } else if (location === "Hot Flash") {
        return (
            <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 "}>
                {location}
            </span>
        )
    } else {
        return (
            <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'}>
                N/A
            </span>
        )
    }
}