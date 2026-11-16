
import TopTabNav from '../../components/TopTabNav';

const tabs = [
    { label: 'Invoice', path: '/dispatch/invoice',  roles: ['ADMIN', 'PURCHASE MANAGER'] },
    
];

export default function Invoice() {
    return (
        <div className="fade-in">
            
            <TopTabNav tabs={tabs} />
            <div className="page-content">
                <p style={{ color: 'var(--text-muted)' }}>Manage Invoice List information and records.</p>
            </div>
        </div>
    );
}
