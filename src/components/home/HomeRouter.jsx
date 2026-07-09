import { useAuth } from "../../context/AuthContext"
import HomePage from "./HomePage"
import ArtistHomePage from "./ArtistHomePage"
import { PuffLoader } from 'react-spinners'

export default function HomeRouter() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <PuffLoader color="#8b5cf6" size={60} />
      </div>
    )
  }

  if (user?.role === 'artist') {
    return <ArtistHomePage />
  }

  return <HomePage />
}
