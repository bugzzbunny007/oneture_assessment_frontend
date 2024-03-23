// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';





import React, { useState, useEffect, Fragment } from 'react';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { useMemo } from 'react';

import { MDBBadge, MDBBtn, MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import "./App.css"
import Button from '@mui/material/Button';
import FilterListIcon from '@mui/icons-material/FilterList';


const App = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableIndustries, setAvailableIndustries] = useState([]);
  const [showFilters , setShowFilters] = useState(false);

  const itemsPerPage = 15;
  useEffect(() => {
    fetchData();
  }, []);

 

  const API_URL = "http://localhost:8080/api/data"

  const fetchData = async (pageNumber) => {
    try {
      console.log("pageno came in fetchdata",pageNumber)
      const response = await axios.get(`${API_URL}?pageNumber=${pageNumber}`);

      setData(response.data.items);
 
      const locations = [...new Set(response.data.items.map(item => item.item.additionalFields.displayLocation.toUpperCase()))];
      // in the industry field i can see some values are same but writing convention is different eg.financial services & financial-services to make them one i used this replace function 
      const industries = [...new Set(response.data.items.map(item => item.item.additionalFields.industry.toUpperCase().replace('-', ' ')))];
      setAvailableLocations(['', ...locations]); // Include an empty option for All Locations
      setAvailableIndustries(['', ...industries]); // Include an empty option for All Industries
      setFilteredData(response.data.items); // Initial load without filters
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filterData = (location, industry, search) => {
    const filtered = data.filter(item => {
      const locationMatch = !location || item.tags.some(tag => tag.name.toLowerCase() === location.toLowerCase());
      const industryMatch = !industry || item.item.additionalFields.industry.toLowerCase() === industry.toLowerCase();
      const searchMatch = !search || item.item.additionalFields?.customerNameLower?.toLowerCase().includes(search.toLowerCase()) || item.item.additionalFields.descriptionSummary.toLowerCase().includes(search.toLowerCase());
      return locationMatch && industryMatch && searchMatch;
    });
    setFilteredData(filtered);
  };
  
  // const handlePageChange = async ({ selected }) => {
  //   setPageNumber(selected);
  //   // Calculate the offset for fetching data based on the selected page number
  //   const offset = selected * itemsPerPage
  //   try {
  //     // Fetch data from the API with the calculated offset
  //     const response = await axios.get(`${API_URL}?offset=${offset}`);
  
  //     // Update the filtered data with the new fetched data
  //     setFilteredData(response.data.items);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // };

  const handleLocationFilterChange = (e) => {
    setLocationFilter(e.target.value);
    filterData(e.target.value, industryFilter, searchTerm);
  };
  
  const handleIndustryFilterChange = (e) => {
    setIndustryFilter(e.target.value);
    filterData(locationFilter, e.target.value, searchTerm);
  };
  
  const handleSearchTermChange = (e) => {
    console.log("search term",e.target.value)
    setSearchTerm(e.target.value);
    filterData(locationFilter, industryFilter, e.target.value);
  };

  const exportToExcel = () => {
    // Implement export functionality here
  };

  const handleNextPageChange = () => {
    setPageNumber(pageNumber+1);
    fetchData(pageNumber + 1);
    
  };

  const handlePerviousPageChange = ({ selected }) => {
    setPageNumber(pageNumber-1);
      fetchData(pageNumber - 1);

  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  return (
    <div className="container">
      <div className="filter-bar">
      <button className='toggleButton' onClick={toggleFilters}>
  <FilterListIcon /> Toggle Filters
</button>
      {showFilters && (
          <div className={`filters ${showFilters ? 'expanded' : 'collapsed'}`}>
            <input
              type="text"
              placeholder="Search customer name or description"
              value={searchTerm}
              onChange={handleSearchTermChange}
            />
            <select value={locationFilter} onChange={handleLocationFilterChange}>
              <option value="">All Locations</option>
              {availableLocations.map((item, index) => (
                <option key={index} value={item}>{item}</option>
              ))}
            </select>
            <select value={industryFilter} onChange={handleIndustryFilterChange}>
              <option value="">All Industries</option>
              {availableIndustries.map((item, index) => (
                <option key={index} value={item}>{item}</option>
              ))}
            </select>
            <button onClick={exportToExcel}>Export to Excel</button>
          </div>
        )}
       
      
      
       
       
      </div>
      
    

        <MDBTable align='middle'>
      <MDBTableHead>
        
        <tr>
          <th scope='col'>Customer Details</th>
          {/* <th scope='col'>Name</th> */}
          <th scope='col'>Headline</th>
          <th scope='col'>Summary</th>
          <th scope='col'>Page URL</th>
          <th scope='col'>Location</th>
          <th scope='col'>Industry</th>

         
        </tr>
      </MDBTableHead>
      <MDBTableBody>


     
      {
        filteredData.map((item, index) => (
      <Fragment>
        <tr>
          <td>
            <div className='d-flex align-items-center'>
            <img src={item.item.additionalFields.imageSrcUrl} alt="Customer Logo"  style={{ width: '55px', height: '45px' }} className='rounded-circle' />

              
              <div className='ms-3'>
                <p className='fw-bold mb-1'>{item.item.additionalFields['customer-name']}</p>
               
              </div>
            </div>
          </td>
          <td>
          <a href={item.item.additionalFields.headlineUrl} target="_blank" rel="noopener noreferrer">
                    {item.item.additionalFields.headline}
                  </a>
          </td>
          
          <td>
            {item.item.additionalFields.descriptionSummary}
          </td>
          <td>

          <a href={item.item.additionalFields.headlineUrl} target="_blank" rel="noopener noreferrer">
                    {item.item.additionalFields.headlineUrl}
                  </a>

          </td>
          <td>
          {item.item.additionalFields.displayLocation}
          </td>
          <td>{item.item.additionalFields.industry}</td>
        </tr>
      </Fragment>
          ))}
      </MDBTableBody>
    </MDBTable>

    <nav class="paginate-container" aria-label="Pagination"> 
            <div class="pagination"> 
            <button className='pagination-button' onClick={handlePerviousPageChange}>
              Previous Page
            </button>
            <p className="mx-4 my-2">{pageNumber}</p>
            <button className='pagination-button' onClick={handleNextPageChange}>
             Next Page
            </button>

            </div> 
        </nav> 
      

    </div>
  );
};

export default App;
