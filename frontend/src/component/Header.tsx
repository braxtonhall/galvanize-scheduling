import React, {useState, useContext, useEffect} from 'react';
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

	console.log(role, [interfaces.Role.HUMAN_RESOURCE, interfaces.Role.HIRING_MANAGER]);

	return (
		<div>
			<Navbar color="light" light expand="md">
				<NavbarBrand><img src="/galvanize-logo.svg"/></NavbarBrand>
				<NavbarToggler onClick={toggle} />
				<Collapse isOpen={isOpen} navbar>
					<Nav className="ml-auto" navbar>
						{
							([interfaces.Role.HUMAN_RESOURCE, interfaces.Role.HIRING_MANAGER].includes(role)) &&
							<NavItem>
								<Link to="/candidates">
									<NavLink>Candidates</NavLink>
								</Link>
							</NavItem>
						}

						{
							([interfaces.Role.HUMAN_RESOURCE, interfaces.Role.HIRING_MANAGER].includes(role)) &&
							<NavItem>
								<Link to="/scheduling">
									<NavLink>Scheduling</NavLink>
								</Link>
							</NavItem>
						}
						{
							([interfaces.Role.HUMAN_RESOURCE, interfaces.Role.HIRING_MANAGER].includes(role)) &&
							<NavItem>
								<Link to="/interviewers">
									<NavLink>Interviewers</NavLink>
								</Link>
							</NavItem>
						}
						{
							([interfaces.Role.HUMAN_RESOURCE].includes(role)) &&
							<NavItem>
								<Link to="/human_resources">
									<NavLink>Human Resources</NavLink>
								</Link>
							</NavItem>
						}
						{
							token &&
							<NavItem>
								<Link to="/login">
									<NavLink onClick={logout}>Logout</NavLink>
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
