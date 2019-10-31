import {app} from "../index";
import * as express from "express";
import session from 'express-session';

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: 'jJEtjKy28f',
    resave: false,
    saveUninitialized: false,
    unset: 'destroy'
}));