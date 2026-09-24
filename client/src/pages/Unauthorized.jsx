const Unauthorized = () => {
    return (
        <div className="unauthorized-page">
            <div className="unauthorized-card">
                <span className="unauthorized-code">403</span>

                <h1>Access Denied</h1>

                <p>
                    You don't have permission to access this page.
                </p>
            </div>
        </div>
    );
};

export default Unauthorized;