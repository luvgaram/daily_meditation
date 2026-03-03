# Application Blueprint

## Overview

A mindfulness and meditation app designed to provide a calming and immersive experience for users. The app features a variety of tools to help users relax, focus, and cultivate a sense of peace and well-being.

## Style, Design, and Features

- **Theming**: Implemented a theme switcher with three distinct themes: Forest, Ocean, and Rain. Each theme has a unique color palette and background image, creating an immersive and visually appealing experience.
- **Interactive Elements**:
  - **Breathing Circle**: An interactive- breathing circle that subtly moves with the user's mouse, providing a calming and engaging visual element.
  - **Audio Visualizer**: An audio visualizer that reacts to the currently playing sound, enhancing the sensory experience.
  - **Ambient Sounds**: Ambient sounds for each theme (rain, forest, ocean) that loop automatically, creating a relaxing and focused atmosphere.
- **Meditation Timer**:
  - **Auditory Cues**: A singing bowl sound plays at the beginning and end of each meditation session, providing clear auditory cues for the user.
  - **Customizable Timer**: A meditation timer that allows users to set their desired meditation duration.
  - **Progress Tracker**: A progress tracker that logs the number of completed meditation sessions, providing a sense of accomplishment and motivating users to continue their practice.
  - **Notifications**: A notification system to alert users when their meditation session is complete.
- **Affirmations**:
  - **Dynamic Affirmations**: A feature that displays a new affirmation each time the user clicks a button, providing a source of inspiration and positive reinforcement.
- **Polar Integration (Serverless)**:
  - **Secure Checkout**: Refactored the payment flow to use a serverless function (`/api/checkout`) for creating Polar checkout sessions. This is a more secure approach as it keeps the API token off the client.
  - **Server-Side SDK**: The serverless function uses the `@polar-sh/sdk` to communicate with the Polar API, creating a checkout session and returning a URL.
  - **Sandbox Environment**: The SDK is now correctly configured to use Polar's sandbox environment for development and testing.
  - **Client-Side Flow**: The client-side JavaScript now calls this serverless function and redirects the user to the returned checkout URL.
  - **Payment Success Notification**: After a successful payment, the user is redirected back to the main page, which now displays a "Payment Successful" notification.
  - **Configuration**: The `POLAR_PRODUCT_ID` is now hardcoded in `main.js` (as it's not a sensitive secret), and the serverless function loads the `POLAR_API_TOKEN` from a `.dev.vars` file for local development.
- **Accessibility and Design**:
  - **Responsive Design**: A fully responsive and accessible application that provides a seamless experience for all users on all devices.
  - **Modern UI**: A modern and intuitive user interface with a clean layout, beautiful typography, and visually appealing design elements.
  - **Zen Mode**: A Zen Mode that simplifies the UI, allowing users to focus on their meditation without distractions.
  - **About Section**: An "About" section to provide users with more information about the app and its features.

## Bug Fixes

- **Breathing Circle Animation**: Restored the CSS for the breathing circle animation, which was accidentally removed during a previous refactoring.
- **Zen Mode Exit**: Corrected a flaw where the "Exit Zen Mode" button would become invisible, making it difficult to leave Zen Mode. The button is now always visible and accessible when Zen Mode is active.
- **Header Button Overflow**: Fixed an issue where header buttons were getting cut off on smaller screens. The header's CSS was simplified to use a centered, wrapping flexbox layout (`display: flex`, `flex-wrap: wrap`, `justify-content: center`). This ensures all header elements are visible and properly aligned on all screen sizes without introducing stacking bugs.
- **Module Resolution & SDK Usage**: Fixed a series of errors related to the Polar SDK. The implementation was changed to use the correct client-side SDK (`@polar-sh/checkout`), import it from a CDN with the correct named import syntax, and use the appropriate method (`PolarEmbedCheckout.create()`) to initiate the checkout. This has now been superseded by the serverless function approach.
- **Local Server ES Module Issue**: Fixed a `ReferenceError: require is not defined` error in the local development server (`server.js`) by converting CommonJS `require` statements to ES module `import` statements and adding `__dirname`/`__filename` compatibility for Node.js ES modules.
- **Serverless Function 500 Error**: Fixed a 500 Internal Server Error in the `/api/checkout` function. The error was caused by an incorrect payload being sent to the Polar SDK. The code was updated to send `products: [productId]` instead of `product_id: productId`, as required by the Polar API.
- **Cloudflare Pages Build/405 Error**: Fixed a build failure and a subsequent 405 "Method Not Allowed" error on the deployed Cloudflare Pages site. The serverless function (`functions/api/checkout.js`) was refactored to be purely Cloudflare-native by only exporting the required `onRequestPost` function. The local Express server (`server.js`) was updated to duplicate the checkout logic for local testing, ensuring both environments work correctly.

## Local Development

To run this project locally, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Start the Development Server:**
    ```bash
    npm start
    ```
    This will start a local server, usually accessible at `http://localhost:3000`.
3.  **Environment Variables:**
    Ensure you have a `.dev.vars` file in the root directory with your `POLAR_API_TOKEN`. For example:
    ```
    POLAR_API_TOKEN=your_polar_api_token_here
    ```
    The `POLAR_PRODUCT_ID` is hardcoded in `main.js`.
4.  **Testing Redirects Locally:**
    The Polar checkout process requires a publicly accessible `success_url` to redirect the user back to your application. Since `http://localhost:3000` is not public, you will need to use a tunneling service like `ngrok`.
    *   Run `ngrok http 3000` in a separate terminal.
    *   Copy the public forwarding URL provided by ngrok (e.g., `https://<your-ngrok-subdomain>.ngrok.io`).
    *   In `functions/api/checkout.js`, temporarily replace `req.headers.origin` with your ngrok URL to test the redirect flow.
