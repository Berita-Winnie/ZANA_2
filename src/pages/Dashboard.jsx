import Layout from '../components/layout'

function Dashboard() {
  return (
    <Layout>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500">Total Resources</h3>
          <p className="text-2xl font-bold">1200</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500">Distributions</h3>
          <p className="text-2xl font-bold">350</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500">Schools Reached</h3>
          <p className="text-2xl font-bold">45</p>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
