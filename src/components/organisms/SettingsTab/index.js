import React from 'react'
import PropTypes from 'prop-types'
import { Form, Message, Button, Header, Divider, Popup, List, Grid, Dimmer, Loader, Container } from 'semantic-ui-react'
import { customErrors } from '../../../services/error_utility'
import { initialErrorUnit } from '../../../store/ttrs/selectors'

class SettingsTab extends React.Component {
  constructor(props) {
    super(props)

    let collegeIndex = null
    let departmentIndex = null
    let majorIndex = null
    props.colleges.forEach((college, index) => {
      if (college.id === props.college) {
        collegeIndex = index
      }
    })
    if (collegeIndex !== null) {
      props.colleges[collegeIndex].departments.forEach((department, index) => {
        if (department.id === props.department) {
          departmentIndex = index
        }
      })
      if (departmentIndex !== null) {
        props.colleges[collegeIndex].departments[departmentIndex].majors.forEach((major, index) => {
          if (major.id === props.major) {
            majorIndex = index
          }
        })
      }
    }

    this.state = {
      passwordOld: '',
      password: '',
      passwordConfirm: '',
      grade: props.grade,
      collegeIndex,
      departmentIndex,
      majorIndex,
      passwordWithdraw: '',
    }

    this.props.onGetNotRecommendCourses(this.props.notRecommends)
  }

  componentWillUnmount() {
    this.props.onSetError(initialErrorUnit)
  }

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value })
  }

  handleUpdateInfo = () => {
    const errors = customErrors({
      passwordOld: [this.state.passwordOld === this.props.password, 'Incorrect password.'],
      passwordConfirm: [this.state.password === this.state.passwordConfirm, 'Two passwords should be same.'],
    })
    if (errors !== null) {
      this.props.onSetError(errors)
      return
    }

    this.props.onSetError(initialErrorUnit)
    let info = {
      username: this.state.username,
      grade: this.state.grade,
    }
    const college = this.props.colleges[this.state.collegeIndex].id
    let department = null
    let major = null
    if (this.state.departmentIndex !== null) {
      department = this.props.colleges[this.state.collegeIndex].departments[this.state.departmentIndex].id
      if (this.state.majorIndex !== null) {
        major = this.props.colleges[this.state.collegeIndex].departments[this.state.departmentIndex].majors[this.state.majorIndex].id
      }
    }
    info = {
      ...info,
      college,
      department,
      major,
    }
    if (this.state.password.trim()) {
      info = {
        ...info,
        password: this.state.password,
      }
    }
    this.props.onUpdateInfo(info)
  }

  handleWithdraw = () => {
    const errors = customErrors({
      passwordWithdraw: [this.state.passwordWithdraw === this.props.password, 'Incorrect password.'],
    })
    if (errors !== null) {
      this.props.onSetError({ bools: errors.bools, texts: {} })
      return
    }

    this.props.onSetError(initialErrorUnit)
    this.props.onWithdraw()
  }

  render() {
    const errors = this.props.errors

    const gradeOptions = [1, 2, 3, 4, 5, 6].map(grade => ({ key: grade, text: grade, value: grade }))
    const collegeOptions = this.props.colleges.map((college, index) => ({ key: college.id, text: college.name, value: index }))
    const departmentOptions = [{ key: -1, text: '---', value: null }]
    if (this.state.collegeIndex !== null) {
      departmentOptions.push(...this.props.colleges[this.state.collegeIndex].departments.map((department, index) => ({
        key: department.id,
        text: department.name,
        value: index,
      })))
    }
    const majorOptions = [{ key: -1, text: '---', value: null }]
    if (this.state.departmentIndex !== null) {
      majorOptions.push(...this.props.colleges[this.state.collegeIndex].departments[this.state.departmentIndex].majors.map((major, index) => ({
        key: major.id,
        text: major.name,
        value: index,
      })))
    }

    return (
      <Container>
        <div>
          <Grid>
            <Grid.Row>
              <Grid.Column>
                <Dimmer active={this.props.updateProfileLoading} inverted>
                  <Loader>Loading</Loader>
                </Dimmer>
                <Header as="h2" content="Update Profile" />
                <Form id="form" onSubmit={this.handleUpdateInfo}>
                  <Form.Input
                    required
                    label="Old Password"
                    icon="lock"
                    iconPosition="left"
                    placeholder="Old password"
                    type="password"
                    name="passwordOld"
                    value={this.state.passwordOld}
                    error={errors.bools.passwordOld}
                    onChange={this.handleChange}
                  />
                  <Form.Input
                    label="Password"
                    icon="lock"
                    iconPosition="left"
                    placeholder="Password"
                    type="password"
                    name="password"
                    value={this.state.password}
                    error={errors.bools.password}
                    onChange={this.handleChange}
                  />
                  <Form.Input
                    label="Password Confirm"
                    icon="lock"
                    iconPosition="left"
                    placeholder="Password Confirm"
                    type="password"
                    name="passwordConfirm"
                    value={this.state.passwordConfirm}
                    error={errors.bools.passwordConfirm}
                    onChange={this.handleChange}
                  />
                  <Form.Select
                    label="Grade"
                    required
                    placeholder="Grade"
                    options={gradeOptions}
                    name="grade"
                    value={this.state.grade}
                    error={errors.bools.grade}
                    onChange={this.handleChange}
                  />
                  <Form.Select
                    label="College"
                    required
                    placeholder="College"
                    options={collegeOptions}
                    name="collegeIndex"
                    value={this.state.collegeIndex}
                    error={errors.bools.college}
                    onChange={(e, { name, value }) => {
                      this.setState({ [name]: value })
                      this.setState({ departmentIndex: null })
                      this.setState({ majorIndex: null })
                    }}
                  />
                  <Form.Select
                    label="Department"
                    placeholder="Department"
                    options={departmentOptions}
                    name="departmentIndex"
                    value={this.state.departmentIndex}
                    error={errors.bools.department}
                    onChange={(e, { name, value }) => {
                      this.setState({ [name]: value })
                      this.setState({ majorIndex: null })
                    }}
                  />
                  <Form.Select
                    label="Major"
                    placeholder="Major"
                    options={majorOptions}
                    name="majorIndex"
                    value={this.state.majorIndex}
                    error={errors.bools.major}
                    onChange={this.handleChange}
                  />
                  <Button type="submit" color="teal">Update</Button>
                </Form>
                {Object.keys(errors.texts).length > 0 &&
                <Message
                  negative
                  header="There are some errors with your submission"
                  list={Object.keys(errors.texts).map(key => errors.texts[key])}
                />}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
        <Divider />
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <Dimmer active={this.props.notRecommendsLoading} inverted>
                <Loader>Loading</Loader>
              </Dimmer>
              <div>
                <Header as="h2" content="Not Recommends" />
                <List verticalAlign="middle" ordered>
                  {this.props.notRecommendCourses.map((course) => (
                    <List.Item key={course.id}>
                      <List.Content floated="right">
                        <Popup
                          trigger={<Button
                            icon="delete"
                            color="red"
                            inverted
                            onClick={() => this.props.onDeleteFromNotRecommends(this.props.notRecommends, course.id)}
                          />}
                          content="Allow to recommend this course from now."
                          inverted
                        />
                      </List.Content>
                      <List.Header as="h3">
                        {course.name}
                      </List.Header>
                    </List.Item>
                  ))}
                </List>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Divider />
        <div>
          <Header as="h2" content="Withdraw" />
          <Popup
            on="click"
            hideOnScroll
            trigger={<Button icon="user x" negative content="Withdraw" />}
            content={<Form>
              <Form.Input
                name="passwordWithdraw"
                onChange={this.handleChange}
                error={errors.bools.passwordWithdraw}
                type="password"
                placeholder="Input your password..."
                action={<Popup
                  inverted
                  trigger={<Button
                    type="submit"
                    attached="right"
                    icon="exclamation triangle"
                    color="red"
                    onClick={this.handleWithdraw}
                  />}
                  content="You cannot undo this action."
                />}
              />
            </Form>}
          />
        </div>
      </Container>
    )
  }
}

SettingsTab.propTypes = {
  password: PropTypes.string,
  grade: PropTypes.number,
  college: PropTypes.number,
  department: PropTypes.number,
  major: PropTypes.number,
  notRecommends: PropTypes.array,
  notRecommendCourses: PropTypes.array,
  colleges: PropTypes.array,
  errors: PropTypes.object,
  notRecommendsLoading: PropTypes.bool,
  updateProfileLoading: PropTypes.bool,
  onUpdateInfo: PropTypes.func,
  onWithdraw: PropTypes.func,
  onGetNotRecommendCourses: PropTypes.func,
  onDeleteFromNotRecommends: PropTypes.func,
  onSetError: PropTypes.func,
}

export default SettingsTab
