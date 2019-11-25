import {Card, CardBody, CardHeader, CardText, Col, Container, Row, Button} from "reactstrap";
import React, {useEffect, useState} from "react";
import ReactMarkdown from "react-markdown";
import Fade from "react-reveal/Fade"
import download from "downloadjs";

const documents: [string, string][] = [
	["Project Briefing", "documents/project_briefing.pdf"],
	["Business Requirements Document", "documents/business_requirements_document.pdf"],
	["Project Plan", "documents/project_plan.pdf"],
	["Terms of Reference", "documents/terms_of_reference.pdf"],
	["Test Plan", "documents/test_plan.pdf"],
	["Development Documentation", "documents/development_documentation.md"],
];

const About: React.FC = () => {

	const [markdown, updateMarkdown] = useState();

	useEffect(() => {
		fetch("documents/development_documentation.md")
			.then(response => {
				return response.text()
			})
			.then(text => {
				updateMarkdown(text);
			})
	}, []);



	function makeDownloadButton([buttonText, url]: [string, string], index: number, arr: [string, string][]): JSX.Element {

		async function downloadFile(): Promise<void> {
			const res = await fetch(url);
			const blob = await res.blob();
			download(blob, buttonText);
		}

		return (
			<React.Fragment key={"download_" + index}>
				<Button className="mb-1" color="primary" onClick={downloadFile} size="sm">
					{buttonText}
				</Button>
				<br/>
				{/*{index !== arr.length - 1 && <hr/>}*/}
			</React.Fragment>
		)
	}

	return (
		<Container className="mb-4">
			<Row>
				<Col sm="12" md="6">
					<Fade left>
						<Card className="mt-4">
							<CardHeader>Authors</CardHeader>
							<CardBody>
								<CardText>
									This project was developed for the class <a
									href="https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-course&dept=CPSC&course=319" target="_blank">CPSC
									319 Software Engineering Project</a>&nbsp;
									at <a href="https://www.ubc.ca/" target="_blank">The University of British Columbia</a> by...
									<ul>
										<li><a href="https://github.com/andreatamez" target="_blank">Andrea Tamez</a></li>
										<li><a href="https://github.com/braxtonhall" target="_blank">Braxton Hall</a></li>
										<li><a href="https://github.com/Metroxe" target="_blank">Christopher Powroznik</a></li>
										<li><a href="https://github.com/Cinders-P" target="_blank">Cindy Hsu</a></li>
										<li><a href="https://github.com/ksyeo1010" target="_blank">Kwangsoo Yeo</a></li>
										<li><a href="https://github.com/Masahiro-Toyomura" target="_blank">Masahiro Toyomura</a></li>
									</ul>

								</CardText>
							</CardBody>
						</Card>
					</Fade>
				</Col>
				<Col sm="12" md="6">
					<Fade right>
						<Card className="mt-4">
							<CardHeader>Documents</CardHeader>
							<CardBody>
								{documents.map(makeDownloadButton)}
							</CardBody>
						</Card>
					</Fade>
				</Col>
				{
					markdown &&
					<Col md="12">
						<Fade bottom>
							<Card className="mt-4">
								<CardHeader>Development Documentation</CardHeader>
								<CardBody>
									<ReactMarkdown source={markdown}/>
								</CardBody>
							</Card>
						</Fade>
					</Col>
				}
			</Row>
		</Container>
	)
};

export default About;