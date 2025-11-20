import { initializeApp, getApps } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { firebaseConfig } from './config'

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const db = getDatabase(app)

export { app, db }
