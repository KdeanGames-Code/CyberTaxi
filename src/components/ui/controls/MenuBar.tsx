// src/components/ui/controls/MenuBar.tsx
/**
 * @file MenuBar.tsx
 * @description Top navigation bar component for CyberTaxi UI.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.3
 * @note Provides a fixed header with logo, stats (Bank before Score), and help/energy icons, with taxi click handler.
 */
import "../../../styles/MenuBar.css";

/**
 * MenuBar component rendering the top navigation.
 * @param {Object} props - Component props.
 * @param {function} props.onTaxiClick - Handler for taxi icon click to open TaxiMenu.
 * @returns {JSX.Element} The rendered menu bar.
 * @description Uses a grid layout for logo, stats, and energy/help sections.
 */
const MenuBar = ({
    onTaxiClick,
}: {
    onTaxiClick: (e: React.MouseEvent) => void;
}) => {
    return (
        <div className="menu-bar">
            <i className="fas fa-taxi logo" onClick={onTaxiClick} />
            <div className="stats-container">
                <div className="stats">
                    <div className="stat-item">
                        <span>Bank</span>
                        <span>$50k</span>
                    </div>
                    <div className="stat-item">
                        <span>Score</span>
                        <span>1000</span>
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
