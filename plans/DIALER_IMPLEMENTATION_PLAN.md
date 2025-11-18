# Dialer Implementation Plan

This document outlines the plan to replace the homepage search bar with a new 3-step "dialer" component that constructs a search query.

## 1. Create Dialer Configuration

- **File:** `src/config/dialerConfig.ts`
- **Purpose:** To define the content for the first two static menus of the dialer.
- **Details:** This file will export a configuration object containing the labels and `lucide-react` icon names for the first two levels of the dialer.

## 2. Build the Dialer Component

- **File:** `src/components/Dialer.tsx`
- **Purpose:** To create the main component for the 3-step dialer.
- **Details:**
    - It will manage the state of the 3-step process.
    - It will render the first two menus using the configuration file.
    - The third menu will be dynamically fetched from a new API endpoint.
    - Each menu will be displayed as a grid of icons with labels.
    - As the user makes selections, the component will build a search query string.
    - Once the user completes the third step, they will be redirected to the search page with the constructed query.

## 3. Create the Dynamic Menu API Endpoint

- **File:** `src/pages/api/dialer/generateMenu.ts`
- **Purpose:** To generate the third menu's content dynamically.
- **Details:**
    - It will receive the user's selections from the first two menus as context.
    - It will use the `GeminiDataProvider` to generate a list of relevant sub-categories.
    - The endpoint will return a JSON array of menu items, each with a label and a `lucide-react` icon name.

## 4. Update the Homepage

- **File:** `src/pages/index.astro`
- **Purpose:** To replace the existing `SearchBar` with the new `Dialer` component.
- **Details:** The `<SearchBar />` component will be removed and replaced with `<Dialer />`.
