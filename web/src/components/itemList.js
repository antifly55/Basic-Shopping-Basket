import React, {Component} from 'react';
import {gql} from 'apollo-boost';
import {Query} from "react-apollo";
import {Container, Row, Col, Card, Button} from 'react-bootstrap';
import {getCurrencyRate} from 'currencies-exchange-rates';
import NumberFormat from "react-number-format";

const GET_ITEMS_QUERY = gql`
    query tokenToItems($token: String!){
        getItems(token: $token){
            name,
            price,
            imgUrl,
            selected,
        }
    }`;

class ItemList extends Component {
    constructor(props) {
        super(props);

        const items = [];
        const currency = [];
        this.state = {
            items: items,
            currency: currency,
        };
        this.rate = 0.001;
    }

    addItemClicked = event => {
        const idx = event.target.getAttribute('id');
        this.props.addItems(idx);
    }

    removeItemClicked = event => {
        const idx = event.target.getAttribute('id');
        if(this.props.countById("selected", idx)) {
            this.props.removeItem(idx);
        } else {
            alert("물건을 -1개로 만드는 것은 불가능하다고 생각합니다. ");
        }
    }

    currencyConvert = async event => {
        const idx = event.target.getAttribute('id');
        const newCurrency = [];
        for(let i = 0; i < this.state.currency.length; i++)
            newCurrency.push(this.state.currency[i]);
        newCurrency[idx] = !newCurrency[idx];
        this.setState({
            currency: newCurrency,
        });
        this.rate = (await getCurrencyRate('KRW', 'USD')).rates.USD;
    }

    itemCard = () => {
        const cards = [];
        for(let i = 0; i < this.state.items.length; i++){
            cards.push(<Col sm={6}>
                <Card style={{ marginBottom: '10px' }}>
                    <Card.Img variant="top" src={this.state.items[i].imgUrl} style={{width: '100%', height: '20vw', objectFit: 'cover'}} />
                <Card.Body>
                    <Card.Title>{this.state.items[i].name}</Card.Title>
                    <Card.Text>
                        <NumberFormat value={this.state.items[i].price * (this.state.currency[i] ? this.rate : 1)} displayType={'text'} thousandSeparator={true} prefix={this.state.currency[i] ? '$' : '₩'} />
                        <br />
                        <Button variant="link" style={{padding: '0'}} id={i} onClick={this.currencyConvert}>{this.state.currency[i] ? 'Convert To KRW' : 'Convert To USD'}</Button>
                    </Card.Text>
                    <Button variant={
                        'primary'
                    } id={i} onClick={this.addItemClicked}>{
                        'Add to cart'
                    }</Button>
                    <Button variant={
                        'secondary'
                    } id={i} onClick={this.removeItemClicked}>{
                        'Remove from cart'
                    }</Button>
                    <br />
                    개수: {this.props.countById("selected", i)}
                </Card.Body>
                </Card>
            </Col>
            );
        }
        console.log(cards);
        return cards;
    }

    render() {
        return (
            <div>
                <Query query={GET_ITEMS_QUERY}
                       variables={{token: localStorage.getItem("token")}}
                       onCompleted={data => {
                           const name = [];
                           const selected = [];
                           const price = [];
                           const currency = [];
                           for(let i = 0; i < data.getItems.length; i++) {
                               name.push(data.getItems[i].name);
                               selected.push(data.getItems[i].selected);
                               price.push(data.getItems[i].price);
                               currency.push(false);
                           }
                           this.props.setItemData(name, selected, price);
                           this.setState({
                               items: data.getItems,
                               currency: currency,
                           });
                       }}>
                    {({loading, error, data}) => {
                        if (loading) return "Loading...";
                        if (error) return `Error! ${error.message}`;
                        return <div/> ;
                    }}
                </Query>
                <Container>
                    <Row>
                        <this.itemCard />
                    </Row>
                </Container>
            </div>
        );
    }
}

export default ItemList;
