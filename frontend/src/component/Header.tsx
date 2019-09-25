import React, {useState} from 'react';
import {
	Collapse,
	Navbar,
	NavbarToggler,
	NavbarBrand,
	Nav,
	NavItem,
	NavLink,
} from 'reactstrap';
import {Link} from "react-router-dom";

const Header: React.FC = () => {

	const [isOpen, updateIsOpen] = useState(false);

	function toggle() {
		updateIsOpen(!isOpen);
	}

	return (
		<div>
			<Navbar color="light" light expand="md">
				<NavbarBrand href="/">Galvanize Interview Scheduling</NavbarBrand>
				<NavbarToggler onClick={toggle} />
				<Collapse isOpen={isOpen} navbar>
					<Nav className="ml-auto" navbar>
						<NavItem>
							<Link to="/">
								<NavLink>Human Resources</NavLink>
							</Link>
						</NavItem>
						<NavItem>
							<Link to="/">
								<NavLink>Hiring Managers</NavLink>
							</Link>
						</NavItem>
					</Nav>
				</Collapse>
			</Navbar>
		</div>
	)
};

export default Header;
