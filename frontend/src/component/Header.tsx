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
import {interfaces} from "adapter";

const Header: React.FC = () => {
	const {token, updateContext} = useContext(Context);
	const [isOpen, updateIsOpen] = useState(false);
	const [role, updateRole] = useState<interfaces.Role>();

	useEffect(() => {
		adapter.determineTokenType(token)
			.then(({success, data}) => {
				if (success && token) {
					updateRole(data);
				} else {
					updateRole(undefined);
				}
			});
	}, [token]);

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
				<NavbarToggler onClick={toggle} />
				<Collapse isOpen={isOpen} navbar>
					<Nav className="ml-auto" navbar>
						{
							([interfaces.Role.HUMAN_RESOURCE, interfaces.Role.HIRING_MANAGER].includes(role)) &&
							<NavItem>
								<Link className="nav-link" to="/candidates">
									Candidates
								</Link>
							</NavItem>
						}

						{
							([interfaces.Role.HUMAN_RESOURCE, interfaces.Role.HIRING_MANAGER].includes(role)) &&
							<NavItem>
								<Link className="nav-link" to="/scheduling">
									Scheduling
								</Link>
							</NavItem>
						}
						{
							([interfaces.Role.HUMAN_RESOURCE, interfaces.Role.HIRING_MANAGER].includes(role)) &&
							<NavItem>
								<Link className="nav-link" to="/interviewers">
									Interviewers
								</Link>
							</NavItem>
						}
						{
							([interfaces.Role.HUMAN_RESOURCE].includes(role)) &&
							<NavItem>
								<Link className="nav-link" to="/human_resources">
									Human Resources
								</Link>
							</NavItem>
						}
						{
							token &&
							<NavItem>
								<Link className="nav-link" to="/login" onClick={logout}>
									Logout
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
