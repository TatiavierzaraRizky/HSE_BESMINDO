export default function Test() {
    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#004d32',
                color: '#dfff00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '10px',
            }}
        >
            <h1
                style={{
                    fontSize: '48px',
                    fontWeight: '800',
                }}
            >
                BESMINDO HSE
            </h1>

            <p
                style={{
                    color: 'white',
                    fontSize: '20px',
                }}
            >
                Laravel + React + Inertia berhasil!
            </p>
        </div>
    );
}