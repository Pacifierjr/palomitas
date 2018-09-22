import React, {Fragment, Component} from 'react';
import HomeHeading from './HomeHeading';
import Select from 'react-select';
import styled from 'styled-components';
import theme from './theme';
import Spinner from './Spinner';
import Waypoint from 'react-waypoint';
import { Link } from 'react-router-dom';
import config from './config';

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, auto);
  grid-gap: ${theme.spaces[1]}px ${theme.spaces[2]}px;
  max-width: 100vw;
  padding: ${theme.spaces[2]}px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(3, auto);
  }
  @media (max-width: 650px) {
    grid-template-columns: repeat(2, auto);
  }
  
  .show {
    display: block;
    position: relative;
    transition: transform 0.3s ease-in-out;
    border: 1px solid transparent;
    min-height: 100px;
    &:hover {
      transform: scale(1.05);
    }
    img {
      max-width: 100%;
      border-radius: 4px 4px;
    }
    .title {
      border-radius: 0 0 4px 4px;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      background: rgba(0,0,0, 0.7);
      color: white;
      font-weight: bold;
      padding: ${theme.spaces[3]}px;
      margin-bottom: ${theme.spaces[1]}px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`;

const SelectWrapper = styled.div`
  margin-bottom: ${theme.spaces[4]}px;
  display: flex;
  align-items: center;
  label {
    display: block;
    margin-right: ${theme.spaces[2]}px;
  }
  > div {
    min-width: 180px;
    color: ${theme.colors.black4};
  }
`;

function parseQueryString(url) {
  return new URLSearchParams(url.replace('?', ''));
}

class Home extends Component {
  state = {
    loading: true,
    sort: config.sortOptions[0],
    page: 1,
    search: '',
    shows: [],
    perPage: 50
  }

  componentDidMount() {
    const urlParams = parseQueryString(this.props.location.search);
    const search = urlParams.get('search') || '';
    this.setState({search, page: search ? 'all' : 1}, () => {
      this.fetchShows()
    })
  }

  componentWillReceiveProps(nextProps) {
    const newQuery = parseQueryString(nextProps.location.search);
    const newSearch = newQuery.get('search') || '';
    if (newSearch && newSearch !== this.state.search) {
      this.setState({shows: [], search: newSearch, page: 'all'}, () => {
        this.fetchShows()
      })
    }
  }

  handleSortChange = (sort) => {
    this.setState({sort, page: 1, shows: []}, () => this.fetchShows());
  }

  handleNextPage = () => {
    if (this.state.loading || this.state.page === 'all') {
      return;
    }
    this.setState(prev => ({page: prev.page + 1}), () => {
      this.fetchShows()
    });
  }

  fetchShows() {
    const {sort, page, search} = this.state;
    this.setState({loading: true})
    const url = `${config.catalogApi}/shows/${page}?sort=${sort.value}`;
    return fetch(url).then(res => res.json())
    .then(data => {
      const parsed = data.map(show => {
	      Object.keys(show.images).forEach(key => {
	        show.images[key] = show.images[key]
            .replace("trakt.us", "trakt.tv")
            .replace("http", "https");
	      });
     	  return show;
      }).filter(show => {
        if (!search) {
          return true;
        }
        return show.title.toLowerCase()
          .indexOf(search.toLowerCase()) !== -1
      })
      this.setState(prevState => ({
        shows: prevState.shows.concat(parsed),
        loading: false
      }))
    })
  }

  render() {
    const {loading, sort, shows} = this.state;
    return (
      <Fragment>
        <HomeHeading />
        <div style={{padding: 8}}>
          <SelectWrapper>
            <label htmlFor="sort">Ordenar por</label>
            <Select
              value={sort}
              options={config.sortOptions}
              onChange={this.handleSortChange}
            />
          </SelectWrapper>
          <p>Mostrando {shows.length} series:</p>
        </div>
        <Grid>
          {shows.map(show => (
            <Link to={`/show/${show._id}`} className="show" key={show._id}>
              <img alt="poster" src={show.images.fanart} />
              <div className="title">{show.title}</div>
            </Link>
          ))}
        </Grid>
        {loading ? 
          <Spinner /> :
          <div style={{height: 1}}>
            <Waypoint scrollableAncestor={window} onEnter={this.handleNextPage} />
          </div>
        }
      </Fragment>
    );
  }
}

export default Home;