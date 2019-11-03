import {app} from "../index";
import * as express from "express";


app.use(express.json());
app.use(express.urlencoded({extended: true}));