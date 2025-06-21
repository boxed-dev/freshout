# <i><b>`FreshOut`</b></i>

An interactive e-commerce platform that reimagines online shopping through natural language commands and contextual awareness. <br>

---

<samp>

> <b>[!IMPORTANT]</b><br>
> <b>Interactive Experience:</b> FreshOut can integrate with language models for intelligent responses. <br>
> You'll need an API key for the full interactive experience. The application's core features work without it. <br>
> Keep your API credentials secure and monitor usage to avoid unexpected charges.

---

## <b>Features</b>

- <b>`Shop with Everyday Language`</b>: Navigate and shop using plain English commands (e.g., "add two of those to my cart", "show me all products in electronics").
- <b>`Smart Shopping Assistant`</b>: An assistant that understands your current page, cart contents, and even what you're pointing at.
- <b>`Point-and-Talk Interaction`</b>: The assistant recognizes which product you're looking at and can answer questions about it.
- <b>`Smart Navigation`</b>: Navigate directly through text commands - "go to cart", "show product details", "take me home".
- <b>`Persistent Shopping Experience`</b>: Cart and chat history synchronized across browser tabs and sessions.
- <b>`Smart Cart Management`</b>: Add, remove, and modify quantities through natural language or the standard UI.
- <b>`Cross-Platform Persistence`</b>: IndexedDB integration ensures your data persists across sessions.
- <b>`Voice Interaction (Coming Soon)`</b>: Future updates will include support for voice commands.

---

## <b>Setup</b>

<b>Important:</b> For the full interactive experience, you'll need an API key. The application's core features work without it.

### Prerequisites
- `Node.js` (18.0+)
- `npm` or `pnpm` (package manager)
- `API Key` (optional)

### Installation

1. Clone the repository:<br>
   ```bash
   git clone <repository-url>
   cd freshout
   ```

2. Install dependencies:<br>
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Start the development server:<br>
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

5. (Optional) Configure your API key through the chat settings for the full interactive experience.

---

## <b>Usage</b>

### Command-Based Shopping

Once FreshOut is running, you can interact with the shopping assistant using natural language:

```
"add 2 of the blue shirts to my cart"
"show me all available laptops"
"navigate to my cart"
"what are the best-selling items?"
"remove the last item from my cart"
"go to product details for the wireless mouse"
```

### Interactive Conversations

The assistant understands your current context:

```
# When pointing at a product
"tell me more about this"
"add this to cart"
"are there other colors available?"

# When on the cart page
"how much is my total?"
"empty my cart"
"proceed to checkout"

# When on a product page
"add 3 of these to the cart"
"show me similar products"
"what are the specs?"
```

### Smart Navigation Commands

Navigate seamlessly through text commands:
- **"take me home"** → Navigates to the homepage
- **"go to cart"** → Opens the shopping cart
- **"show me [product]"** → Navigates to a specific product page

---

## <b>Technical Architecture</b>

FreshOut operates through a context-aware system:

1.  **`Context Management`**:
    *   **CartContext**: Manages shopping cart state with real-time updates.
    *   **ChatContext**: Handles conversations with full application context.
    *   **HoverContext**: Tracks user interactions to understand what the user is pointing at.
    *   All contexts communicate seamlessly for a unified user experience.

2.  **`Conversation Core`**:
    *   **Language Model Integration**: Uses language models to power helpful responses and command interpretation.
    *   **Context Injection**: The current page, cart contents, and pointer location are fed to the language model.
    *   **Command Processing**: Natural language is parsed into actionable commands.
    *   **Fallback System**: Provides helpful rule-based responses when the advanced assistant is unavailable.

3.  **`Data Persistence`**:
    *   **IndexedDB**: Client-side storage for cart and chat history.
    *   **Cross-tab Sync**: Real-time synchronization across browser tabs.
    *   **Session Recovery**: Automatic restoration of user state on page reload.

4.  **`Smart Navigation`**:
    *   **Route Prefetching**: Anticipatory loading of likely destinations.
    *   **Context-Aware Routing**: Navigation commands are processed based on the current state.
    *   **Smooth Transitions**: Optimized page transitions with loading states.

### Component Architecture
```
App Layout
├── Providers (Context Wrappers)
│   ├── CartProvider
│   ├── ChatProvider
│   └── HoverProvider
├── Navbar (Navigation + Cart Indicator)
├── ChatBot (Assistant Interface)
└── Pages
    ├── Home (Product Grid)
    ├── Product Details
    └── Shopping Cart
```

---

## <b>Problems Faced and Solutions</b>

Building an interactive, command-driven e-commerce platform presented unique challenges:

1.  **`Context Awareness Complexity`**:
    *   **Problem**: Maintaining awareness of the user's current state across multiple contexts (page, cart, hover).
    *   **Solution**: Implemented a hierarchical context system with real-time state sharing and optimized re-renders using React's `useMemo` and `useCallback`.

2.  **`Interpreting User Commands`**:
    *   **Problem**: Accurately interpreting user commands for cart operations and navigation.
    *   **Solution**: Developed a sophisticated prompt engineering system that feeds the current application state to the assistant, enabling context-aware command interpretation.

3.  **`Cross-Tab Synchronization`**:
    *   **Problem**: Keeping the cart and chat state synchronized across multiple browser tabs.
    *   **Solution**: Implemented a dual-layer persistence system using `localStorage` events for real-time sync and IndexedDB for reliable storage.

4.  **`Performance with Real-time Updates`**:
    *   **Problem**: Frequent state updates causing performance issues with a complex UI.
    *   **Solution**: Optimized component rendering with `React.memo`, strategic use of `useCallback`, and efficient state update patterns.

5.  **`Response Reliability`**:
    *   **Problem**: Ensuring consistent responses even with varying user input styles.
    *   **Solution**: Implemented comprehensive error handling, fallback responses, and command validation to ensure a reliable user experience.

6.  **`Integrating Pointer-Based Context`**:
    *   **Problem**: Capturing and utilizing hover interactions for contextual responses.
    *   **Solution**: Created a dedicated `HoverContext` that tracks element interactions and feeds this data to the assistant for enhanced contextual awareness.

---

## <b>Design Principles</b>

FreshOut is built upon the following core principles:

-   **`Context-First Design`**: Every interaction considers the user's current state and context for personalized responses.
-   **`Conversation-First Interface`**: The traditional UI is enhanced with a natural language interface for an intuitive user experience.
-   **`Performance-Conscious`**: Optimized for speed with prefetching, memoization, and efficient state management.
-   **`Accessibility-Focused`**: Designed with screen readers, keyboard navigation, and semantic HTML in mind.
-   **`Progressive Enhancement`**: Core functionality works without an API key, while the full experience is enabled with one.

---

## <b>Highlights</b>

### Contextual Shopping Assistant
- **Real-time Context Awareness**: Understands the current page, cart contents, and user interactions.
- **Point-and-Talk Interaction**: Responds to items you're currently pointing at.
- **Smart Command Processing**: Interprets natural language for cart operations and navigation.

### Seamless State Management
- **Cross-Tab Synchronization**: Cart and chat history sync across browser tabs.
- **Persistent Sessions**: Automatic recovery of user state across browser sessions.
- **Real-time Updates**: Instant UI updates with optimized performance.

### Command-Based Navigation
- **Text-Based Navigation**: Navigate the store through natural language commands.
- **Predictive Prefetching**: Anticipatory loading of likely destinations.
- **Context-Aware Routing**: Navigation suggestions based on the current user state.

---

## <b>Feedback & Contributions</b>

We'd love to hear your thoughts! If you encounter any issues, have suggestions for improvement, or want to contribute:
- Please open an issue on the GitHub repository.
- For contributions, feel free to fork the repository and submit a pull request.
- Share your experience with the interactive shopping features!

Your feedback helps us improve the natural language shopping experience.

---

## License

This project is licensed under the MIT License.

</samp>
