import {combineReducers} from "utils"

import app from "./app"
import status from "./status"
import diff from "./diff"
import log from "./log"

export default combineReducers({app, status, diff, log})
