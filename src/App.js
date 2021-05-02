import React from "react";
import axios from "axios";
import { 
  Container,
  Col,
  Collapse, 
  Navbar, 
  NavbarToggler, 
  NavbarBrand, 
  Nav, 
  Form, 
  FormGroup, 
  Label, 
  Input,
  Card, 
  CardImg,
  CardColumns,
  Modal,
  ModalBody,
  Spinner,
  ListGroup,
  ListGroupItem
} from 'reactstrap';
import './App.css';
import LazyLoad from 'react-lazy-load';

class App extends React.Component{
  constructor(props){
    super(props);
  
    this.state = {
      tag: "",
      collapsed: false,
      getImages: [],
      isOpenModal: false,
      isLoading: false,
      error: false,
      history: []
    }

    this.onChange = this.onChange.bind(this);
    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.onEnter = this.onEnter.bind(this);
    this.renderImages = this.renderImages.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  container = React.createRef();

  toggleNavbar(){
    this.setState({
      collapsed: !this.state.collapsed
    })
  }

  componentDidMount(){
    this.setState({
      isLoading: true
    })
    const encodedURI = encodeURI(`https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=5423dbab63f23a62ca4a986e7cbb35e2&format=json&nojsoncallback=1`)
    axios.get(encodedURI)
    .then((res) => {
      const parse = res.data;
      const photos = parse.photos.photo
      let arr = []
      for(let i=0; i< photos.length; i++){
        var photo = photos[i]
        var encodedURI = encodeURI(`https://c1.staticflickr.com/${photo.farm}/${photo.server}/${photo.id}_${photo.secret}_m.jpg`)
        arr.push(encodedURI)
      }
      this.setState({
        isLoading: false,
        getImages: arr
      })
    })
    .catch(function (error) {
      this.setState({
        error: true,
        isLoading: false
      });
    });

    this.getHistory()

    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside = (event) => {
    if (
      this.container.current &&
      !this.container.current.contains(event.target)
    ) {
      this.setState({
        showHistory: false,
      });
    }
  };

  onChange(evant){
    this.setState({
      tag: evant.target.value,
      showHistory: false
    }, () => {
      this.handleSubmit(this.state.tag)
    })

  }

  onEnter(event){
    if (event.key === 'Enter') {
      event.preventDefault();

      let history = this.state.history.length !== 0 ? this.state.history : {history: []};
      history = [...this.state.history, {text:this.state.tag}]
      
      localStorage.setItem('history', JSON.stringify(history));

      this.handleSubmit(this.state.tag);
      this.getHistory();
    }
  }

  handleSubmit(tag){
    if(tag !== ""){
      this.setState({
        isLoading: true,
        showHistory: false
      })
      const encodedURI = encodeURI(`https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=5423dbab63f23a62ca4a986e7cbb35e2&tags=${tag}&format=json&nojsoncallback=1`)
      axios.get(encodedURI)
      .then((res) => {
        const parse = res.data;
        const photos = parse.photos.photo
        let arr = []
        for(let i=0; i< photos.length; i++){
          var photo = photos[i]
          var encodedURI = encodeURI(`https://c1.staticflickr.com/${photo.farm}/${photo.server}/${photo.id}_${photo.secret}_m.jpg`)
          arr.push(encodedURI)
        }
        this.setState({
          isLoading: false,
          getImages: arr
        })
      })
      .catch(function (error) {
        this.setState({
          error: true,
          isLoading: false
        });
      });
    }
  }

  renderImages(arr){
      if(arr.length === 0 && !this.state.isLoading) {
        return <h3 className="font-weight-normal text-center position-absolute w-100 py-5 left0">Empty result, type something else!</h3>
      } else {
        return(
          arr.map((image, i) => (
            <div className="text-center" key={i}>
              <LazyLoad key={i} height={250}>
                <Card className="mb-0" key={i} onClick={() => this.openModalImage(true, i)}>
                  <CardImg src={image} alt={"Card image id"+i}/>
                </Card>
              </ LazyLoad>
              <Spinner style={{ width: '2rem', height: '2rem' }} color="primary" />
            </div>
          ))
        )
      }
  }

  openModalImage(bool, i){
    this.setState({
      isOpenModal: bool,
      imageId: i
    })
  }

  getHistory(){
    let data = JSON.parse(localStorage.getItem('history'));
    
    if(data !== null){
      data = [...new Map(data.map(item => [JSON.stringify(item), item])).values()];
    } else {
      data = []
    }

    this.setState({
      history: data,
      showHistory: false
    });
  }

  onFocus = () => {
    this.setState({
      showHistory: true
    })
  }

  clearHistory = () => {
    localStorage.removeItem('history');
    this.getHistory();
  }

  onClickSearch = (item) => {
    this.setState({
      tag: item.text
    })
    this.handleSubmit(item.text);
  }

  fetchMoreData = () => {
    
    setTimeout(() => {
      this.setState({
        getImages: this.state.getImages
      });
    }, 1500);
  };


  render(){
    const {getImages} = this.state;
    return(
      <>
        <Container fluid={true}>
          <Navbar color="primary faded" fixed='top' expand="md" dark>
            <NavbarBrand href="/" className="mr-auto">Flickr Photo Search</NavbarBrand>
            <NavbarToggler onClick={this.toggleNavbar} />
            <Collapse isOpen={this.state.collapsed} navbar className="justify-content-end row">
              <Col sm="12" md={5}>
                <Nav navbar className="position-relative">
                  <Form className="w-100">
                    <FormGroup className="mb-0">
                      <Label for="searchPhoto" className="sr-only">Search</Label>
                      <Input 
                        type="text" 
                        name="search" 
                        id="searchPhoto" 
                        onChange={this.onChange}
                        onKeyPress={this.onEnter}
                        onFocus={this.onFocus}
                        placeholder="Search here..." 
                        bsSize="lg"
                        autoComplete="off"
                        value={this.state.tag}
                      />
                    </FormGroup>
                  </Form>
                  {this.state.showHistory && (
                    <div className="position-absolute w-100 top3" ref={this.container}>
                      <ListGroup>
                        {this.state.history.length !== 0 ? this.state.history.map((item, i) => (
                            <ListGroupItem className="text-left justify-content-between" key={i} tag="button" onClick={() => this.onClickSearch(item)}>
                              {item.text}
                            </ListGroupItem>
                        )) 
                        : 
                        <ListGroupItem>No history!</ListGroupItem>
                        }
                        
                        {this.state.history.length !== 0 && 
                          <ListGroupItem tag="button" color="danger" onClick={this.clearHistory}>Clear</ListGroupItem>}
                      </ListGroup>
                    </div>
                  )}
                </Nav>
              </Col>
            </Collapse>
          </Navbar>
          
          <CardColumns className="pt-7 ">
            {!this.state.error ?
              this.renderImages(getImages)
            :
              <h3 className="font-weight-normal text-center position-absolute w-100 py-5 error-text left0">Opps... search faild!</h3>
            }
          </CardColumns>
          {this.state.isLoading && (
            <div className="loader">
              <Spinner style={{ width: '5rem', height: '5rem' }} color="primary" />
            </div>
          )}
        </Container>

        {/**** MODAL****/}
        <Modal isOpen={this.state.isOpenModal} toggle={() => {this.openModalImage(false, null)}} className="modal-dialog-centered modal-lg">
          <ModalBody>
            <img src={this.state.getImages[this.state.imageId]} alt={"Card image id "+this.state.imageId} className="w-100 max-height500" />
          </ModalBody>
        </Modal>
      </>
    )
  }
}

export default App;
