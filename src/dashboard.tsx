import { DatabaseExplorer } from "./components/database-explorer"

function Dashboard() {
    return (
        <>
            <div className="p-3 bg-[#3C3D37]">
                <DatabaseExplorer />
            </div>
        </>
    )
}

export default Dashboard