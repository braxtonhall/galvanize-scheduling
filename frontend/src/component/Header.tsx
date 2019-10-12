import React, {useState, useContext, useEffect} from 'react';
import {
	Collapse,
	Navbar,
	NavbarToggler,
	NavbarBrand,
	Nav,
	NavItem,
} from 'reactstrap';
import adapter from "../services/Adapter";
import Context from '../services/Context';
import {Link} from "react-router-dom";

const Header: React.FC = () => {
	const {token, updateContext} = useContext(Context);
	const [isOpen, updateIsOpen] = useState(false);

	function toggle() {
		updateIsOpen(!isOpen);
	}

	async function logout() {
		if (token) {
			await adapter.logout(token);
			updateContext({token: undefined});
		}
	}

	return (
		<div>
			<Navbar color="light" light expand="md">
				<NavbarBrand><img alt="galvanize logo" src="/galvanize-logo.svg"/></NavbarBrand>
				{
					token &&
					<React.Fragment>
						<NavbarToggler onClick={toggle}/>
						<Collapse isOpen={isOpen} navbar>
							<Nav className="ml-auto" navbar>

								<NavItem>
									<Link className="nav-link" to="/candidates">
										Candidates
									</Link>
								</NavItem>
								<NavItem>
									<Link className="nav-link" to="/scheduling">
										Scheduling
									</Link>
								</NavItem>
								<NavItem>
									<Link className="nav-link" to="/login" onClick={logout}>
										Logout
									</Link>
								</NavItem>
							</Nav>
						</Collapse>
					</React.Fragment>
				}
			</Navbar>
		</div>
	)
};

export default Header;
