import React, {useState, useContext} from 'react';
import {
	Collapse,
	Navbar,
	NavbarToggler,
	NavbarBrand,
	Nav,
	NavItem,
	NavLink,
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
				<NavbarBrand><img src="/galvanize-logo.svg"/></NavbarBrand>
				<NavbarToggler onClick={toggle} />
				<Collapse isOpen={isOpen} navbar>
					<Nav className="ml-auto" navbar>
						{
							token &&
							<NavItem>
								<NavLink onClick={logout}>Logout</NavLink>
							</NavItem>
						}
						{
							token &&
							<NavItem>
								<Link to="/candidates">
									<NavLink>Candidates</NavLink>
								</Link>
							</NavItem>
						}
					</Nav>
				</Collapse>
			</Navbar>
		</div>
	)
};

export default Header;
