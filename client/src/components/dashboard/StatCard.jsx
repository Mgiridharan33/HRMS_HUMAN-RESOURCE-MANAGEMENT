const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    className = "",
}) => {
    return (
        <div className={`stat-card ${className}`}>

            <div className="stat-card-top">

                <div className="stat-card-icon">
                    <Icon size={22} />
                </div>

                <span className="stat-card-title">
                    {title}
                </span>

            </div>

            <div className="stat-card-value">
                {value}
            </div>

            <div className="stat-card-description">
                {description}
            </div>

        </div>
    );
};

export default StatCard;