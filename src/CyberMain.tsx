// src/CyberMain.tsx
/**
 * @file CyberMain.tsx
 * @description Main entry point for CyberTaxi, defining the new UI/UX layout.
 * @author Kevin-Dean Livingstone & CyberTaxi Team
 * @version 0.2.3
 * @note Replaces main.tsx with a three-row structure: MenuBar, Map, BottomMenu, using CyberGlobal.css.
 */
import ReactDOM from "react-dom/client";
import "./CyberGlobal.css"; // Base layout stylesheet
import MenuBar from "./components/ui/controls/MenuBar"; // New MenuBar component

// Dummy components for layout
const Map = () => <div className="map-area">Map Area Placeholder</div>;
const BottomMenu = () => (
    <div className="bottom-menu">Bottom Menu Placeholder</div>
);

/**
 * Main application component with the new layout.
 * @returns {JSX.Element} The rendered three-row UI structure.
 * @description Sets up containers for MenuBar, Map, and BottomMenu with global styling.
 */
const CyberMain = () => {
    return (
        <div id="app">
            <MenuBar />
            <Map />
            <BottomMenu />
        </div>
    );
};

/**
 * Renders the CyberMain component to the DOM.
 * @note Assumes #app element exists in index.html; applies new layout with CyberGlobal.css.
 */
ReactDOM.createRoot(document.getElementById("app")!).render(<CyberMain />);
console.log("CyberMain: App rendering initiated with new layout");
