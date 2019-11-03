import {Card, CardBody, CardHeader, CardText, Container} from "reactstrap";
import React, {useEffect, useState} from "react";
import ReactMarkdown from "react-markdown";
import Fade from "react-reveal/Fade"

const About: React.FC = () => {

	const [markdown, updateMarkdown] = useState("");

	useEffect(() => {
		fetch("/Documentation.md")
			.then(response => {
				return response.text()
			})
			.then(text => {
				updateMarkdown(text);
			})
	}, []);

	return (
		<Container className="mb-4">
			<Fade left>
				<Card className="mt-4">
					<CardHeader>About</CardHeader>
					<CardBody>
						<CardText>
							This project was developed for the class <a href="https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-course&dept=CPSC&course=319">CPSC 319 Software Engineering Project</a>&nbsp;
							at <a href="https://www.ubc.ca/">The University of British Columbia</a> by....
							<ul>
								<li><a href="https://github.com/Metroxe">Christopher Powroznik</a></li>
								<li><a href="https://github.com/braxtonhall">Braxton Hall</a></li>
								<li><a href="https://github.com/andreatamez">Andrea Tamez</a></li>
								<li><a href="https://github.com/Cinders-P">Cindy Hsu</a></li>
								<li><a href="https://github.com/ksyeo1010">Kwangsoo Yeo</a></li>
								<li><a href="https://github.com/Masahiro-Toyomura">Masahiro Toyomura</a></li>
							</ul>

						</CardText>
					</CardBody>
				</Card>
			</Fade>
			{
				markdown &&
				<Fade right>
					<Card className="mt-4">
						<CardHeader>Development Documentation</CardHeader>
						<CardBody>
							<ReactMarkdown source={markdown}/>
						</CardBody>
					</Card>
				</Fade>
			}
		</Container>
	)
};

export default About;