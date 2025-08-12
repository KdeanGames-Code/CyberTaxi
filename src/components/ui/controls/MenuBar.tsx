// src/components/MenuBar.tsx
/**
 * @file MenuBar.tsx
 * @description Top navigation bar component for CyberTaxi UI.
 * @author Kevin-Dean Livingstone & CyberTaxi Team
 * @version 0.1.1
 * @note Provides a fixed header with logo, stats, and help/energy icons.
 */
import "../../../styles/MenuBar.css";

/**
 * MenuBar component rendering the top navigation.
 * @returns {JSX.Element} The rendered menu bar.
 * @description Uses a grid layout for logo, stats, and energy/help sections.
 */
const MenuBar = () => {
    return (
        <div className="menu-bar">
            <i className="fas fa-taxi logo" />
            <div className="stats-container">
                <div className="stats">
                    <div className="stat-item">
                        <span>Score</span>
                        <span>1000</span>
                    </div>
                    <div className="stat-item">
                        <span>Cash</span>
                        <span>$50k</span>
                    </div>
                </div>
            </div>
            <div className="energy-help">
                <div className="energy">
                    <span>Energy</span>
                    <div className="energy-bar">
                        <div className="energy-fill" />
                    </div>
                </div>
                <i className="fas fa-question help" />
            </div>
        </div>
    );
};

export default MenuBar;
