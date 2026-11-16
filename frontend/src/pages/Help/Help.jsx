
import TopTabNav from '../../components/TopTabNav';

const tabs = [
    { label: 'Help', path: '/help/help',  roles: ['ADMIN', 'PURCHASE_MANAGER'] },
    
];

export default function Help() {
    return (
        <div className="fade-in">
           
            <TopTabNav tabs={tabs} />
            <div className="page-content">
                <p style={{ color: 'var(--text-muted)' }}>Manage Help List information and records.</p>
            </div>
        </div>
    );
}
